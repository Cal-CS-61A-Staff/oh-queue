import datetime
import functools
import collections
import pytz
import random
import time

from flask import render_template, url_for
from flask_login import current_user
from flask_socketio import emit

from oh_queue import app, db, socketio
from oh_queue.models import Assignment, ConfigEntry, Location, Ticket, TicketEvent, TicketEventType, TicketStatus, \
    active_statuses, Appointment, AppointmentSignup, User, AppointmentStatus, AttendanceStatus


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
        'rerequest_threshold': ticket.rerequest_threshold and ticket.rerequest_threshold.isoformat(),
        'hold_time': ticket.hold_time and ticket.hold_time.isoformat(),
        'rerequest_time': ticket.rerequest_time and ticket.rerequest_time.isoformat(),
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

def appointments_json(appointment: Appointment):
    return {
        'id': appointment.id,
        "start_time": appointment.start_time.isoformat(),
        "duration": appointment.duration.total_seconds(),
        "signups": [signup_json(signup) for signup in appointment.signups],
        "capacity": appointment.capacity,
        "location_id": appointment.location_id,
        "helper": appointment.helper and user_json(appointment.helper),
        "status": appointment.status.name,
    }

def signup_json(signup: AppointmentSignup):
    return {
        "id": signup.id,
        "assignment_id": signup.assignment_id,
        "user": user_json(signup.user),
        "question": signup.question,
        "description": signup.description,
        "attendance_status": signup.attendance_status.name,
    }

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
            Ticket.status.in_(active_statuses)
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
    if 'appointments' in attrs:
        appointments = Appointment.query.filter(
            Appointment.start_time > datetime.datetime.utcnow() - datetime.timedelta(hours=10),
            Appointment.status != AppointmentStatus.resolved
        ).all()
        state['appointments'] = [appointments_json(appointment) for appointment in appointments]

    if not broadcast and 'current_user' in attrs:
        state['current_user'] = student_json(current_user)
    if broadcast:
        socketio.emit('state', state)
    else:
        emit('state', state)

def emit_presence(data):
    out = {k: len(v) for k,v in data.items()}
    active_staff = {t.helper.email for t in Ticket.query.filter(Ticket.status.in_(active_statuses), Ticket.helper != None).all()}
    out["staff"] = len(data["staff"] | active_staff)
    socketio.emit('presence', out)

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
    redirect = url_for('index')
    if ticket_id is not None:
        redirect = url_for('ticket', ticket_id=ticket_id)
    return {
        'messages': [
            {
                'category': category,
                'text': message,
            },
        ],
        'redirect': redirect
    }

def socket_redirect(ticket_id=None):
    redirect = url_for('index')
    if ticket_id is not None:
        redirect = url_for('ticket', ticket_id=ticket_id)
    return {
        'redirect': redirect
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

    emit_state(['tickets', 'assignments', 'locations', 'current_user', 'config', 'appointments'])

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

def get_magic_word(mode=None, data=None, time_offset=0):
    if mode is None:
        mode = ConfigEntry.query.get('queue_magic_word_mode').value
    if mode == 'none':
        return None

    if data is None:
        data = ConfigEntry.query.get('queue_magic_word_data').value
    if mode == 'text':
        return data
    if mode == 'timed_numeric':
        # We don't need fancy ultra-secure stuff here
        # A basic server-side time-based, seeded RNG is enough
        # Seed data should be in the form 'a:b:c:d', where:
        # a: 8-byte seed (in hexadecimal)
        # b: Downsampling interval (in seconds)
        # c: Minimum generated number (in unsigned decimal)
        # d: Maximum generated number (in unsigned decimal)
        data = data.split(':')
        # Downsample time to allow for temporal leeway
        rand = random.Random()
        timestamp = time.time() // int(data[1])
        # Seeded RNG
        rand.seed("{}.{}".format(timestamp + time_offset, data[0]))
        return str(rand.randint(int(data[2]), int(data[3]))).zfill(len(data[3]))
    raise Exception('Unrecognized queue magic word mode')

def check_magic_word(magic_word):
    mode = ConfigEntry.query.get('queue_magic_word_mode').value
    if mode == 'none':
        return True
    data = ConfigEntry.query.get('queue_magic_word_data').value
    if mode == 'timed_numeric':
        # Allow for temporal leeway from lagging clients/humans
        for offset in (0, -1, 1):
            if get_magic_word(mode, data, time_offset=offset) == magic_word:
                return True
        return False
    return get_magic_word(mode, data) == magic_word

@socketio.on('refresh_magic_word')
@is_staff
def refresh_magic_word():
    return {
        'magic_word': get_magic_word()
    }

@socketio.on('create')
@logged_in
def create(form):
    """Stores a new ticket to the persistent database, and emits it to all
    connected clients.
    """
    is_closed = ConfigEntry.query.get('is_queue_open')
    if is_closed.value != 'true':
        return socket_error(
            'The queue is closed',
            category='warning',
        )
    if not check_magic_word(form.get('magic_word')):
        return socket_error(
            'Invalid magic_word',
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
    description = form.get('description')
    # Create a new ticket and add it to persistent storage
    if assignment_id is None or location_id is None or not question:
        return socket_error(
            'You must fill out all the fields',
            category='warning',
        )

    description_required = ConfigEntry.query.get('description_required')
    if description is None and descriptionRequired:
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
        description=description
    )

    db.session.add(ticket)
    db.session.commit()

    emit_event(ticket, TicketEventType.create)
    return socket_redirect(ticket_id=ticket.id)

def get_tickets(ticket_ids):
    return Ticket.query.filter(Ticket.id.in_(ticket_ids)).all()

def get_next_ticket(location=None):
    """Return the user's first assigned but unresolved ticket.
    If none exist, return the first pending student re-request.
    If none exist, return to the first unassigned ticket.

    If a location is passed in, only returns a next ticket from
    provided location.
    """
    ticket = Ticket.query.filter(
        Ticket.helper_id == current_user.id,
        Ticket.status == TicketStatus.assigned).first()
    if not ticket:
        ticket = Ticket.query.filter(Ticket.status == TicketStatus.rerequested).filter(Ticket.helper_id == current_user.id)
        ticket = ticket.first()
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

@socketio.on("juggle")
@is_staff
def juggle(data):
    """
    Gets ticket_ids and places them all on the juggle queue for the corresponding staff member
    """
    ticket_ids = data.get('ticket_ids')
    tickets = get_tickets(ticket_ids)
    location = None
    for ticket in tickets:
        ticket.status = TicketStatus.juggled
        ticket.hold_time = datetime.datetime.utcnow()
        ticket.rerequest_threshold = ticket.hold_time + datetime.timedelta(minutes=int(ConfigEntry.query.get("juggling_delay").value))
        location = ticket.location
        emit_event(ticket, TicketEventType.juggle)
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

@socketio.on('return_to')
@is_staff
def return_to(ticket_ids):
    tickets = get_tickets(ticket_ids)
    for ticket in tickets:
        ticket.status = TicketStatus.assigned

        ticket.helper_id = current_user.id
        emit_event(ticket, TicketEventType.return_to)

    db.session.commit()

@socketio.on('rerequest')
def rerequest(data):
    ticket_ids = data.get("ticket_ids")
    tickets = get_tickets(ticket_ids)
    for ticket in tickets:
        if not ticket.user.id == current_user.id:
            return socket_unauthorized()

        if ticket.rerequest_threshold > datetime.datetime.utcnow():
            return socket_unauthorized()

        ticket.status = TicketStatus.rerequested
        ticket.rerequest_time = datetime.datetime.utcnow()

        emit_event(ticket, TicketEventType.rerequest)

    db.session.commit()

@socketio.on('cancel_rerequest')
def rerequest(data):
    ticket_ids = data.get("ticket_ids")
    tickets = get_tickets(ticket_ids)
    for ticket in tickets:
        if not ticket.user.id == current_user.id:
            return socket_unauthorized()

        ticket.status = TicketStatus.juggled
        emit_event(ticket, TicketEventType.juggle)

    db.session.commit()

@socketio.on("release_holds")
@is_staff
def release_holds(data):
    ticket_ids = data.get("ticket_ids")
    to_me = data.get("to_me")
    tickets = get_tickets(ticket_ids)
    for ticket in tickets:
        ticket.helper_id = current_user.id if to_me else None
        emit_event(ticket, TicketEventType.hold_released)
    db.session.commit()

    return socket_redirect()

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
    keys = []
    values = []
    if 'keys' in data:
        keys = data['keys']
        values = data['values']
    elif 'key' in data:
        keys = [data['key']]
        values = [data['value']]
    if 'queue_magic_word_mode' in keys:
        # Validate new magic word config
        get_magic_word(values[keys.index('queue_magic_word_mode')], values[keys.index('queue_magic_word_data')])
    for key, value in zip(keys, values):
        entry = ConfigEntry.query.get(key)
        entry.value = value
    db.session.commit()


    if entry.public:
        emit_state(['config'], broadcast=True)
    return config_json()


@socketio.on("assign_staff_appointment")
@is_staff
def assign_staff_appointment(appointment_id):
    Appointment.query.filter(Appointment.id == appointment_id).first().helper_id = current_user.id
    db.session.commit()
    emit_state(['appointments'], broadcast=True)


@socketio.on("unassign_staff_appointment")
@is_staff
def unassign_staff_appointment(appointment_id):
    Appointment.query.filter(Appointment.id == appointment_id).first().helper_id = None
    db.session.commit()
    emit_state(['appointments'], broadcast=True)


@socketio.on("assign_appointment")
def assign_appointment(data):
    user_id = current_user.id

    if current_user.is_staff:
        user = User.query.filter(User.email == data["email"]).first()
        if not user:
            return socket_unauthorized()
        user_id = user.id

    old_signup = AppointmentSignup.query.filter(
        AppointmentSignup.appointment_id == data["appointment_id"], AppointmentSignup.user_id == user_id
    ).first()

    old_attendance = old_signup.attendance_status if old_signup else AttendanceStatus.unknown

    if old_signup:
        db.session.delete(old_signup)
        db.session.commit()

    appointment = Appointment.query.filter(Appointment.id == data["appointment_id"]).first() # type = Appointment

    if len(appointment.signups) >= appointment.capacity and not current_user.is_staff and not old_signup:
        return socket_unauthorized()

    signup = AppointmentSignup(
        appointment_id=data["appointment_id"],
        user_id=user_id,
        assignment_id=data["assignment_id"],
        question=data["question"],
        description=data["description"],
        attendance_status=old_attendance,
    )
    db.session.add(signup)
    db.session.commit()
    emit_state(['appointments'], broadcast=True)


@socketio.on("unassign_appointment")
def unassign_appointment(signup_id):
    old_signup = AppointmentSignup.query.filter(
        AppointmentSignup.id == signup_id
    ).first()

    if not current_user.is_staff and (not old_signup or old_signup.user_id != current_user.id):
        return socket_unauthorized()

    db.session.delete(old_signup)
    db.session.commit()

    emit_state(['appointments'], broadcast=True)


@socketio.on('load_appointment')
@is_staff
def load_appointment(appointment_id):
    if not appointment_id:
        return socket_error('Invalid appointment ID')
    appointment = Appointment.query.get(appointment_id)
    if appointment:
        return appointments_json(appointment)


@socketio.on('set_appointment_status')
@is_staff
def set_appointment_status(data):
    appointment_id = data["appointment"]
    status = data["status"]
    Appointment.query.get(appointment_id).status = AppointmentStatus[status]
    db.session.commit()

    emit_state(['appointments'], broadcast=True)


@socketio.on("mark_attendance")
@is_staff
def mark_attendance(data):
    signup_id = data["signup_id"]
    attendance_status = data["status"]

    AppointmentSignup.query.get(signup_id).attendance_status = AttendanceStatus[attendance_status]
    db.session.commit()

    emit_state(['appointments'], broadcast=True)

