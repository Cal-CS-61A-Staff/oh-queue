import datetime
import pytz

from flask import (
    jsonify, redirect, render_template, render_template_string, request, url_for
)
from flask_login import current_user, login_required

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
    socketio.emit(event_type.name, {
        'id': ticket.id,
        'user_id': ticket.user_id,
        'user_name': ticket.user.name,
        'add_date': format_datetime(ticket.created),
        'location': ticket.location,
        'assignment': ticket.assignment,
        'question': ticket.question,
        'helper_name': ticket.helper and ticket.helper.name,
        'html': app.jinja_env.get_template('ticket.html').render(
            current_user=current_user,
            ticket=ticket
        )
    })

@app.route('/')
@login_required
def index():
    tickets = Ticket.query.filter(
       Ticket.status.in_([TicketStatus.pending, TicketStatus.assigned])
    ).order_by(Ticket.created).all()
    return render_template('index.html', tickets=tickets,
                current_user=current_user, date=datetime.datetime.now())

@app.route('/create/', methods=['GET', 'POST'])
@login_required
def create():
    """Stores a new ticket to the persistent database, and emits it to all
    connected clients.
    """
    # TODO use WTForms
    if request.method == 'POST':
        # Create a new ticket and add it to persistent storage
        ticket = Ticket(
            status=TicketStatus.pending,
            user=current_user,
            assignment=request.form['assignment'],
            question=request.form['question'],
            location=request.form['location'],
        )
        db.session.add(ticket)
        db.session.commit()

        emit_event(ticket, TicketEventType.create)
        return redirect(url_for('index'))
    else:
        return render_template('create.html')

@app.route('/<int:ticket_id>/')
@login_required
def ticket(ticket_id):
    ticket = Ticket.query.get_or_404(ticket_id)
    pass  # TODO

@app.route('/<int:ticket_id>/cancel/', methods=['POST'])
@login_required
def cancel(ticket_id):
    ticket = Ticket.query.get_or_404(ticket_id)
    ticket.status = TicketStatus.canceled
    db.session.commit()

    emit_event(ticket, TicketEventType.cancel)
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
