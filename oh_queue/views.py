import datetime
import pytz

from flask import render_template
from flask_login import current_user
from flask_socketio import emit

from oh_queue import app, db, socketio
from oh_queue.models import Ticket, TicketStatus, TicketEvent, TicketEventType

def emit_event(ticket, event_type):
    # TODO log

    ticket_event = TicketEvent(
        event_type=event_type,
        ticket=ticket,
        user=current_user,
    )
    db.session.add(ticket_event)
    db.session.commit()
    socketio.emit(event_type.name, ticket_json(ticket))

def ticket_json(ticket):
    return {
        'id': ticket.id,
        'status': ticket.status.name,
        'user_id': ticket.user_id,
        'user_name': ticket.user.name,
        'created': format_datetime(ticket.created),
        'location': ticket.location,
        'assignment': ticket.assignment,
        'question': ticket.question,
        'helper_id': ticket.helper_id,
        'helper_name': ticket.helper and ticket.helper.name,
    }

@socketio.on('connect')
def connect():
    tickets = Ticket.query.filter(
        Ticket.status.in_([TicketStatus.pending, TicketStatus.assigned])
    ).order_by(Ticket.created).all()
    emit('state', {
        'tickets': [ticket_json(ticket) for ticket in tickets],
        'isAuthenticated': current_user.is_authenticated,
        'currentUser': current_user.name if current_user.is_authenticated else "",
        'currentUserID': current_user.id if current_user.is_authenticated else "",
        'isStaff': current_user.is_staff if current_user.is_authenticated else "",
        'email': current_user.email if current_user.is_authenticated else "",
        'shortName': current_user.short_name if current_user.is_authenticated else ""
    })

@app.route('/')
@app.route('/<int:ticket_id>/')
def index(*args, **kwargs):
    return render_template('index.html')

@socketio.on('create')
def create(form):
    """Stores a new ticket to the persistent database, and emits it to all
    connected clients.
    """
    my_ticket = Ticket.for_user(current_user)
    if my_ticket:
        return my_ticket.id
    # Create a new ticket and add it to persistent storage
    if not (form.get('assignment') and form.get('question')
            and form.get('location')):
        return
    ticket = Ticket(
        status=TicketStatus.pending,
        user=current_user,
        assignment=form.get('assignment'),
        question=form.get('question'),
        location=form.get('location'),
    )

    db.session.add(ticket)
    db.session.commit()

    emit_event(ticket, TicketEventType.create)
    return ticket.id

def get_next_ticket():
    """Return the user's first assigned but unresolved ticket.
    If none exist, return to the first unassigned ticket.
    """
    ticket = Ticket.query.filter(
        Ticket.helper_id == current_user.id,
        Ticket.status == TicketStatus.assigned).first()
    if ticket:
        return ticket
    return Ticket.query.filter(
        Ticket.status == TicketStatus.pending).first()

@socketio.on('next')
def next_ticket(ticket_id):
    ticket = get_next_ticket()
    if ticket:
        return ticket.id

@socketio.on('delete')
def delete(ticket_id):
    ticket = Ticket.query.get(ticket_id)
    ticket.status = TicketStatus.deleted
    db.session.commit()

    emit_event(ticket, TicketEventType.delete)

@socketio.on('resolve')
def resolve(ticket_id):
    ticket = Ticket.query.get(ticket_id)
    ticket.status = TicketStatus.resolved
    ticket.helper_id = current_user.id
    db.session.commit()

    emit_event(ticket, TicketEventType.resolve)

    ticket = get_next_ticket()
    if ticket:
        return ticket.id

@socketio.on('assign')
def assign(ticket_id):
    ticket = Ticket.query.get(ticket_id)
    ticket.status = TicketStatus.assigned
    ticket.helper_id = current_user.id
    db.session.commit()

    emit_event(ticket, TicketEventType.assign)

@socketio.on('unassign')
def unassign(ticket_id):
    ticket = Ticket.query.get(ticket_id)
    ticket.status = TicketStatus.pending
    ticket.helper_id = None
    db.session.commit()

    emit_event(ticket, TicketEventType.unassign)

# Filters

local_timezone = pytz.timezone(app.config['LOCAL_TIMEZONE'])

@app.template_filter('datetime')
def format_datetime(timestamp):
    time = pytz.utc.localize(timestamp).astimezone(local_timezone)
    return time.strftime('%I:%M %p')
