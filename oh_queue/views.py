import datetime
import functools
import collections
import pytz
import time

from flask import render_template, url_for
from flask_login import current_user
from flask_socketio import emit

from oh_queue import app, db, socketio
from oh_queue.models import Assignment, ConfigEntry, Location, Ticket, TicketEvent, TicketEventType, TicketStatus

def user_json(user):
    return {
        'id': user.id,
        'email': user.email,
        'name': user.name,
        'shortName': user.short_name,
        'isStaff': user.is_staff,
    }

def student_json(user):
    """ Only send student information to staff. """
    can_see_details = (current_user.is_authenticated
                        and (current_user.is_staff or user.id == current_user.id))
    if not can_see_details:
        return None
    return user_json(user)

def ticket_json(ticket):
    return {
        'id': ticket.id,
        'status': ticket.status.name,
        'user': student_json(ticket.user),
        'created': ticket.created.isoformat(),
        'updated': ticket.updated and ticket.updated.isoformat(),
        'location_id': ticket.location_id,
        'assignment_id': ticket.assignment_id,
        'description': ticket.description,
        'question': ticket.question,
        'helper': ticket.helper and user_json(ticket.helper),
    }

def assignment_json(assignment):
    return {
        'id': assignment.id,
        'name': assignment.name,
        'visible': assignment.visible
    }

def location_json(location):
    return {
        'id': location.id,
        'name': location.name,
        'visible': location.visible
    }

def config_json():
    config = {}
    for config_entry in ConfigEntry.query.all():
        if config_entry.public:
            config[config_entry.key] = config_entry.value
    return config

def emit_event(ticket, event_type):
    ticket_event = TicketEvent(
        event_type=event_type,
        ticket=ticket,
        user=current_user,
    )
    db.session.add(ticket_event)
    db.session.commit()
    socketio.emit('event', {
        'type': event_type.name,
        'ticket': ticket_json(ticket),
    })

def emit_state(attrs, broadcast=False):
    state = {}
    if 'tickets' in attrs:
        tickets = Ticket.query.filter(
            Ticket.status.in_([TicketStatus.pending, TicketStatus.assigned])
        ).all()
        state['tickets'] = [ticket_json(ticket) for ticket in tickets]
    if 'assignments' in attrs:
        assignments = Assignment.query.all()
        state['assignments'] = [assignment_json(assignment) for assignment in assignments]
    if 'locations' in attrs:
        locations = Location.query.all()
        state['locations'] = [location_json(location) for location in locations]
    if 'config' in attrs:
        state['config'] = config_json()
    if not broadcast and 'current_user' in attrs:
        state['current_user'] = student_json(current_user)
    if broadcast:
        socketio.emit('state', state)
    else:
        emit('state', state)

def emit_presence(data):
    socketio.emit('presence', {k: len(v) for k,v in data.items()})

user_presence = collections.defaultdict(set) # An in memory map of presence.

# We run a React app, so serve index.html on all routes
@app.route('/')
@app.route('/<path:path>')
def index(*args, **kwargs):
    return render_template('index.html')

@app.route('/error')
def error(*args, **kwargs):
    return render_template('index.html')

@app.route('/tickets/<int:ticket_id>')
def ticket(*args, **kwargs):
    return render_template('index.html')

def socket_error(message, category='danger', ticket_id=None):
    return {
        'messages': [
            {
                'category': category,
                'text': message,
            },
        ],
        'redirect': url_for('ticket', ticket_id=ticket_id),
    }

def socket_redirect(ticket_id=None):
    return {
        'redirect': url_for('ticket', ticket_id=ticket_id),
    }

def socket_unauthorized():
    return socket_error("You don't have permission to do that")

def logged_in(f):
    @functools.wraps(f)
    def wrapper(*args, **kwds):
        if not current_user.is_authenticated:
            return socket_unauthorized()
        return f(*args, **kwds)
    return wrapper

def is_staff(f):
    @functools.wraps(f)
    def wrapper(*args, **kwds):
        if not (current_user.is_authenticated and current_user.is_staff):
            return socket_unauthorized()
        return f(*args, **kwds)
    return wrapper

def has_ticket_access(f):
    @functools.wraps(f)
    def wrapper(*args, **kwds):
        if not current_user.is_authenticated:
            return socket_unauthorized()
        data = args[0]
        ticket_id = data.get('id')
        if not ticket_id:
            return socket_error('Invalid ticket ID')
        ticket = Ticket.query.get(ticket_id)
        if not ticket:
            return socket_error('Invalid ticket ID')
        if not (current_user.is_staff or ticket.user.id == current_user.id):
            return socket_unauthorized()
        kwds['ticket'] = ticket
        return f(*args, **kwds)
    return wrapper

@socketio.on('connect')
def connect():
    if not current_user.is_authenticated:
        pass
    elif current_user.is_staff:
        user_presence['staff'].add(current_user.email)
    else:
        user_presence['students'].add(current_user.email)

    emit_state(['tickets', 'assignments', 'locations', 'current_user', 'config'])

    emit_presence(user_presence)

@socketio.on('disconnect')
def disconnect():
    if not current_user.is_authenticated:
        pass
    elif current_user.is_staff:
        if current_user.email in user_presence['staff']:
            user_presence['staff'].remove(current_user.email)
    else:
        if current_user.email in user_presence['students']:
            user_presence['students'].remove(current_user.email)
    emit_presence(user_presence)

@socketio.on('refresh')
def refresh(ticket_ids):
    tickets = Ticket.query.filter(Ticket.id.in_(ticket_ids)).all()
    return {
        'tickets': [ticket_json(ticket) for ticket in tickets],
    }

@socketio.on('create')
@logged_in
def create(form):
    """Stores a new ticket to the persistent database, and emits it to all
    connected clients.
    """
    is_closed = ConfigEntry.query.get('is_queue_open')
    if (not is_closed) or (is_closed.value != 'true'):
        return socket_error(
            'The queue is closed',
            category='warning',
        )
    my_ticket = Ticket.for_user(current_user)
    if my_ticket:
        return socket_error(
            'You are already on the queue',
            category='warning',
            ticket_id=my_ticket.ticket_id,
        )
    assignment_id = form.get('assignment_id')
    location_id = form.get('location_id')
    question = form.get('question')
    # Create a new ticket and add it to persistent storage
    if assignment_id is None or location_id is None or not question:
        return socket_error(
            'You must fill out all the fields',
            category='warning',
        )
    assignment = Assignment.query.get(assignment_id)
    if not assignment:
        return socket_error(
            'Unknown assignment (id: {})'.format(assignment_id),
            category='warning',
        )
    location = Location.query.get(location_id)
    if not location:
        return socket_error(
            'Unknown location (id: {})'.format(location_id),
            category='warning',
        )
    ticket = Ticket(
        status=TicketStatus.pending,
        user=current_user,
        assignment=assignment,
        location=location,
        question=question,
    )

    db.session.add(ticket)
    db.session.commit()

    emit_event(ticket, TicketEventType.create)
    return socket_redirect(ticket_id=ticket.id)

def get_tickets(ticket_ids):
    return Ticket.query.filter(Ticket.id.in_(ticket_ids)).all()

def get_next_ticket(location=None):
    """Return the user's first assigned but unresolved ticket.
    If none exist, return to the first unassigned ticket.

    If a location is passed in, only returns a next ticket from
    provided location.
    """
    ticket = Ticket.query.filter(
        Ticket.helper_id == current_user.id,
        Ticket.status == TicketStatus.assigned).first()
    if not ticket:
        ticket = Ticket.query.filter(Ticket.status == TicketStatus.pending)
        if location:
            ticket = ticket.filter(Ticket.location == location)
        ticket = ticket.first()
    if ticket:
        return socket_redirect(ticket_id=ticket.id)
    else:
        return socket_redirect()

@socketio.on('next')
@is_staff
def next_ticket(ticket_ids):
    return get_next_ticket()

@socketio.on('delete')
@logged_in
def delete(ticket_ids):
    tickets = get_tickets(ticket_ids)
    for ticket in tickets:
        if not (current_user.is_staff or ticket.user.id == current_user.id):
            return socket_unauthorized()
        ticket.status = TicketStatus.deleted
        emit_event(ticket, TicketEventType.delete)
    db.session.commit()

@socketio.on('resolve')
@logged_in
def resolve(data):
    """Gets ticket_ids and an optional argument 'local'.
    Resolves all ticket_ids. If 'local' is set, then
    will only return a next ticket from the same location
    where the last ticket was resolved from.
    """
    ticket_ids = data.get('ticket_ids')
    local = data.get('local', False)
    location = None
    tickets = get_tickets(ticket_ids)
    for ticket in tickets:
        if not (current_user.is_staff or ticket.user.id == current_user.id):
            return socket_unauthorized()
        ticket.status = TicketStatus.resolved
        if local:
            location = ticket.location
        emit_event(ticket, TicketEventType.resolve)
    db.session.commit()
    return get_next_ticket(location)

@socketio.on('assign')
@is_staff
def assign(ticket_ids):
    tickets = get_tickets(ticket_ids)
    for ticket in tickets:
        ticket.status = TicketStatus.assigned

        ticket.helper_id = current_user.id
        emit_event(ticket, TicketEventType.assign)
    db.session.commit()

@socketio.on('unassign')
@is_staff
def unassign(ticket_ids):
    tickets = get_tickets(ticket_ids)
    for ticket in tickets:
        ticket.status = TicketStatus.pending
        ticket.helper_id = None
        emit_event(ticket, TicketEventType.unassign)
    db.session.commit()

@socketio.on('load_ticket')
@is_staff
def load_ticket(ticket_id):
    if not ticket_id:
        return socket_error('Invalid ticket ID')
    ticket = Ticket.query.get(ticket_id)
    if ticket:
        return ticket_json(ticket)

@socketio.on('update_ticket')
@has_ticket_access
def update_ticket(data, ticket):
    if 'description' in data:
        ticket.description = data['description']
    if 'location_id' in data:
        ticket.location = Location.query.get(data['location_id'])
    emit_event(ticket, TicketEventType.update)
    db.session.commit()
    return ticket_json(ticket)

@socketio.on('add_assignment')
@is_staff
def add_assignment(data):
    name = data['name']
    assignment = Assignment(name=name)
    db.session.add(assignment)
    db.session.commit()

    emit_state(['assignments'], broadcast=True)
    db.session.refresh(assignment)
    return assignment_json(assignment)

@socketio.on('update_assignment')
@is_staff
def update_assignment(data):
    assignment = Assignment.query.get(data['id'])
    if 'name' in data:
        assignment.name = data['name']
    if 'visible' in data:
        assignment.visible = data['visible']
    db.session.commit()

    emit_state(['assignments'], broadcast=True)
    return assignment_json(assignment)

@socketio.on('add_location')
@is_staff
def add_location(data):
    name = data['name']
    location = Location(name=name)
    db.session.add(location)
    db.session.commit()

    emit_state(['locations'], broadcast=True)
    db.session.refresh(location)
    return location_json(location)

@socketio.on('update_location')
@is_staff
def update_location(data):
    location = Location.query.get(data['id'])
    if 'name' in data:
        location.name = data['name']
    if 'visible' in data:
        location.visible = data['visible']
    db.session.commit()

    emit_state(['locations'], broadcast=True)
    return location_json(location)

@socketio.on('update_config')
@is_staff
def update_config(data):
    entry = ConfigEntry.query.get(data['key'])
    if 'value' in data:
        entry.value = data['value']
    db.session.commit()

    emit_state(['config'], broadcast=True)
    return config_json()
