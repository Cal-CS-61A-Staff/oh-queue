from oh_queue import app, db, socketio
from flask import render_template_string, request, jsonify
from flask_login import current_user

from datetime import datetime
from pytz import timezone

from oh_queue.models import Ticket, TicketStatus

def render_ticket(ticket, assist):
    template = app.jinja_env.get_template('ticket.html')
    return template.render(ticket=ticket, assist=assist)

def return_payload(ticket, assist=False):
    return {
        'id': ticket.id,
        'name': 'Unknown',
        'add_date': format_datetime(ticket.created),
        'location': ticket.location,
        'assignment': ticket.assignment,
        'question': ticket.question,
        'html': render_ticket(ticket, assist),
    }

@app.route('/add_ticket', methods=['POST'])
def add_ticket():
    """Stores a new ticket to the persistent database, and emits it to all
    connected clients.
    """
    if not current_user.is_authenticated:
        abort(403)
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
    socketio.emit('add_ticket_response', return_payload(ticket, assist=True), namespace='/assist')
    socketio.emit('add_ticket_response', return_payload(ticket))
    return jsonify(result='success')

@app.route('/resolve_ticket', methods=['POST'])
def resolve_ticket():
    if not current_user.is_authenticated:
        abort(403)
    ticket_id = request.form['id']

    ticket = Ticket.query.get(ticket_id)
    ticket.status = TicketStatus.resolved
    ticket.helper_id = current_user.id
    db.session.commit()

    socketio.emit('resolve_ticket_response', return_payload(ticket), namespace='/assist')
    socketio.emit('resolve_ticket_response', return_payload(ticket))
    return jsonify(result='success')

"""
This route should be accessed at the end of office hours.
All resolved tickets currently in the database will be cleared out.
The data (without names) will then be returned.
"""
@app.route('/generate_report', methods=['GET'])
def generate_report():
    resolved = Entry.query.filter_by(status=ENTRY.RESOLVED).all()
    data_list = {}
    for i in range(len(resolved)):
        request = resolved[i]
        data_list[i] = {
            # "name": request.name,
            # The data we get should be anonymized
            "assignment": request.assignment,
            "question": request.question,
            "add_date": request.add_date,
            "resolved_date": request.resolved_date,
            "resolved_notes": request.resolved_notes,
            }
        db.session.delete(request)
        db.session.commit()
    return jsonify(data_list)

# Filters

db_timezone = timezone(app.config['DB_TIMEZONE'])
local_timezone = timezone(app.config['LOCAL_TIMEZONE'])

@app.template_filter('datetime')
def format_datetime(timestamp):
    tz_aware = db_timezone.localize(timestamp)
    return tz_aware.astimezone(local_timezone).strftime('%I:%M %p')
