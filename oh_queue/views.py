import datetime
import functools
import pytz

from flask import render_template, url_for
from flask_login import current_user
from flask_socketio import emit

from oh_queue import app, db, socketio
from oh_queue.models import Ticket, TicketStatus, TicketEvent, TicketEventType

def user_json(user):
    return {
        'id': user.id,
        'email': user.email,
        'name': user.name,
        'isStaff': user.is_staff,
    }

def ticket_json(ticket):
    return {
        'id': ticket.id,
        'status': ticket.status.name,
        'assigned_at': ticket.assign_time,
        'resolved_at': ticket.resolve_time,
        'user': user_json(ticket.user),
        'created': ticket.created.isoformat(),
        'location': ticket.location,
        'assignment': ticket.assignment,
        'question': ticket.question,
        'helper': ticket.helper and user_json(ticket.helper),
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

@app.route('/')
@app.route('/<int:ticket_id>/')
def index(*args, **kwargs):
    return render_template('index.html')

def socket_error(message, category='danger', ticket_id=None):
    return {
        'messages': [
            {
                'category': category,
                'text': message,
            },
        ],
        'redirect': url_for('index', ticket_id=ticket_id),
    }

def socket_redirect(ticket_id=None):
    return {
        'redirect': url_for('index', ticket_id=ticket_id),
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

@socketio.on('connect')
def connect():
    tickets = Ticket.query.filter(
        Ticket.status.in_([TicketStatus.pending, TicketStatus.assigned])
    ).all()
    emit('state', {
        'tickets': [ticket_json(ticket) for ticket in tickets],
        'currentUser':
            user_json(current_user) if current_user.is_authenticated else None,
    })

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
    my_ticket = Ticket.for_user(current_user)
    if my_ticket:
        return socket_error(
            'You are already on the queue',
            category='warning',
            ticket_id=my_ticket.ticket_id,
        )
    # Create a new ticket and add it to persistent storage
    if not (form.get('assignment') and form.get('question')
            and form.get('location')):
        return socket_error(
            'You must fill out all the fields',
            category='warning',
        )
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
    return socket_redirect(ticket_id=ticket.id)

def get_next_ticket():
    """Return the user's first assigned but unresolved ticket.
    If none exist, return to the first unassigned ticket.
    """
    ticket = Ticket.query.filter(
        Ticket.helper_id == current_user.id,
        Ticket.status == TicketStatus.assigned).first()
    if not ticket:
        ticket = Ticket.query.filter(
            Ticket.status == TicketStatus.pending).first()
    if ticket:
        return socket_redirect(ticket_id=ticket.id)
    else:
        return socket_redirect()

@socketio.on('next')
@is_staff
def next_ticket(ticket_id):
    return get_next_ticket()

@socketio.on('delete')
@logged_in
def delete(ticket_id):
    ticket = Ticket.query.get(ticket_id)
    if not (current_user.is_staff or ticket.user.id == current_user.id):
        return socket_unauthorized()
    ticket.status = TicketStatus.deleted
    db.session.commit()

    emit_event(ticket, TicketEventType.delete)

@socketio.on('resolve')
@is_staff
def resolve(ticket_id):
    ticket = Ticket.query.get(ticket_id)
    ticket.status = TicketStatus.resolved
    ticket.resolved = db.func.now()
    ticket.helper_id = current_user.id
    db.session.commit()

    emit_event(ticket, TicketEventType.resolve)

    return get_next_ticket()

@socketio.on('assign')
@is_staff
def assign(ticket_id):
    ticket = Ticket.query.get(ticket_id)
    ticket.status = TicketStatus.assigned
    ticket.assigned_at = db.func.now()
    ticket.helper_id = current_user.id
    db.session.commit()

    emit_event(ticket, TicketEventType.assign)

@socketio.on('unassign')
@is_staff
def unassign(ticket_id):
    ticket = Ticket.query.get(ticket_id)
    ticket.status = TicketStatus.pending
    ticket.assigned_at = None
    ticket.helper_id = None
    db.session.commit()

    emit_event(ticket, TicketEventType.unassign)

@socketio.on('load_ticket')
@is_staff
def load_ticket(ticket_id):
    ticket = Ticket.query.get(ticket_id)
    if ticket:
        return ticket_json(ticket)
