import datetime
import pytz

from flask import (
    jsonify, redirect, render_template, render_template_string, request, url_for
)
from flask_login import current_user, login_required

from oh_queue import app, db, socketio
from oh_queue.models import Ticket, TicketStatus

def render_ticket(ticket, assist):
    template = app.jinja_env.get_template('ticket.html')
    return template.render(
        current_user=current_user,
        ticket=ticket,
        assist=assist,
    )

def return_payload(ticket):
    return {
        'id': ticket.id,
        'user_id': ticket.user.id,
        'user_name': ticket.user.name,
        'add_date': format_datetime(ticket.created),
        'location': ticket.location,
        'assignment': ticket.assignment,
        'question': ticket.question,
        'html': render_ticket(ticket, assist=False),
        'assist_html': render_ticket(ticket, assist=True),
    }

@app.route('/')
@login_required
def index():
    tickets = Ticket.query.filter_by(
       status=TicketStatus.pending,
    ).order_by(Ticket.created).all()
    return render_template('index.html', tickets=tickets, date=datetime.datetime.now())

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
            user_id=current_user.id,
            assignment=request.form['assignment'],
            question=request.form['question'],
            location=request.form['location'],
        )
        db.session.add(ticket)
        db.session.commit()

        # Emit the new ticket to all clients
        socketio.emit('create', return_payload(ticket))
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

    # TODO
    socketio.emit('cancel', return_payload(ticket))
    return jsonify(result='success')

@app.route('/<int:ticket_id>/resolve/', methods=['POST'])
@login_required
def resolve(ticket_id):
    ticket = Ticket.query.get_or_404(ticket_id)
    ticket.status = TicketStatus.resolved
    ticket.helper_id = current_user.id
    db.session.commit()

    # TODO
    socketio.emit('resolve', return_payload(ticket))
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
