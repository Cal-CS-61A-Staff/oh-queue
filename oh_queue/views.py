import datetime
import pytz

from flask import (
    abort, jsonify, redirect, flash, render_template, render_template_string,
    request, url_for
)
from flask_login import current_user, login_required
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
    template = app.jinja_env.get_template('macros.html')
    module = template.make_module({'request': request})
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
        'isStaff': current_user.is_staff if current_user.is_authenticated else "",
        'email': current_user.email if current_user.is_authenticated else "",
        'shortName': current_user.short_name if current_user.is_authenticated else ""
    })

@app.route('/')
def index():
    tickets = Ticket.by_status([TicketStatus.pending, TicketStatus.assigned])
    my_ticket = Ticket.for_user(current_user)
    return render_template('index.html',
        tickets=tickets,
        my_ticket=my_ticket,
        date=datetime.datetime.now())

@app.route('/create/', methods=['GET', 'POST'])
@login_required
def create():
    """Stores a new ticket to the persistent database, and emits it to all
    connected clients.
    """
    # TODO use WTForms
    my_ticket = Ticket.for_user(current_user)
    if my_ticket:
        flash("You're already on the queue!", 'warning')
        return redirect(url_for('ticket', ticket_id=my_ticket.id))
    elif request.method == 'POST':
        # Create a new ticket and add it to persistent storage
        if not (request.form.get('assignment') and request.form.get('question')
                and request.form.get('location')):
            flash("You must specify all of the fields", "warning")
            return redirect(url_for('index'))
        ticket = Ticket(
            status=TicketStatus.pending,
            user=current_user,
            assignment=request.form.get('assignment'),
            question=request.form.get('question'),
            location=request.form.get('location'),
        )

        db.session.add(ticket)
        db.session.commit()

        emit_event(ticket, TicketEventType.create)
        return redirect(url_for('index'))
    else:
        return render_template('create.html')

@app.route('/next/', methods=['POST'])
@login_required
def next_ticket():
    """Redirects to the user's first assigned but unresolved ticket.
    If none exist, redirects to the first unassigned ticket.
    """
    ticket = Ticket.query.filter(
        Ticket.helper_id == current_user.id,
        Ticket.status == TicketStatus.assigned).first()
    if ticket:
        return jsonify({"event": "next", "data": ticket_json(ticket)})
    ticket = Ticket.query.filter(
        Ticket.status == TicketStatus.pending).first()
    if ticket:
        return jsonify({"event": "next", "data": ticket_json(ticket)})
    return jsonify({"event": "queue"})

@app.route('/<int:ticket_id>/')
@login_required
def ticket(ticket_id):
    return redirect(url_for('index'))

@app.route('/<int:ticket_id>/delete/', methods=['POST'])
@login_required
def delete(ticket_id):
    ticket = Ticket.query.get_or_404(ticket_id)
    ticket.status = TicketStatus.deleted
    db.session.commit()

    emit_event(ticket, TicketEventType.delete)
    return jsonify(result='success')

@app.route('/<int:ticket_id>/resolve/', methods=['POST'])
@login_required
def resolve(ticket_id):
    ticket = Ticket.query.get_or_404(ticket_id)
    ticket.status = TicketStatus.resolved
    ticket.helper_id = current_user.id
    db.session.commit()

    emit_event(ticket, TicketEventType.resolve)
    return jsonify(result='success')

@app.route('/<int:ticket_id>/assign/', methods=['POST'])
@login_required
def assign(ticket_id):
    ticket = Ticket.query.get_or_404(ticket_id)
    ticket.status = TicketStatus.assigned
    ticket.helper_id = current_user.id
    db.session.commit()

    emit_event(ticket, TicketEventType.assign)
    return jsonify(result='success')

@app.route('/<int:ticket_id>/unassign/', methods=['POST'])
@login_required
def unassign(ticket_id):
    ticket = Ticket.query.get_or_404(ticket_id)
    ticket.status = TicketStatus.pending
    ticket.helper_id = None
    db.session.commit()

    emit_event(ticket, TicketEventType.unassign)
    return jsonify(result='success')

@app.route('/<int:ticket_id>/rate/', methods=['GET', 'POST'])
@login_required
def rate(ticket_id):
    ticket = Ticket.query.get_or_404(ticket_id)
    abort(404)  # TODO

# Filters

local_timezone = pytz.timezone(app.config['LOCAL_TIMEZONE'])

@app.template_filter('datetime')
def format_datetime(timestamp):
    time = pytz.utc.localize(timestamp).astimezone(local_timezone)
    return time.strftime('%I:%M %p')
