import datetime
import pytz

from flask import (
    abort, jsonify, redirect, flash, render_template, render_template_string,
    request, url_for
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
    template = app.jinja_env.get_template('macros.html')
    module = template.make_module({'request': request})
    socketio.emit(event_type.name, {
        'id': ticket.id,
        'user_id': ticket.user_id,
        'user_name': ticket.user.name,
        'add_date': format_datetime(ticket.created),
        'location': ticket.location,
        'assignment': ticket.assignment,
        'question': ticket.question,
        'helper_name': ticket.helper and ticket.helper.name,
        'row_html': module.render_ticket_row(ticket=ticket),
        'html': module.render_ticket(ticket=ticket)
    })

def get_my_ticket():
  return Ticket.query.filter(
      Ticket.user_id == current_user.id,
      Ticket.status.in_([TicketStatus.pending, TicketStatus.assigned]),
  ).one_or_none()

@app.route('/')
@login_required
def index():
    tickets = Ticket.query.filter(
       Ticket.status.in_([TicketStatus.pending, TicketStatus.assigned])
    ).order_by(Ticket.created).all()
    my_ticket = get_my_ticket()
    return render_template('index.html', tickets=tickets, my_ticket=my_ticket,
                current_user=current_user, date=datetime.datetime.now())

@app.route('/create/', methods=['GET', 'POST'])
@login_required
def create():
    """Stores a new ticket to the persistent database, and emits it to all
    connected clients.
    """
    # TODO use WTForms
    my_ticket = get_my_ticket()
    if my_ticket:
        flash("You're already on the queue!", 'warning')
        return redirect(url_for('ticket', ticket_id=my_ticket.id))
    elif request.method == 'POST':
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

@app.route('/next/')
@login_required
def next_ticket():
    """Redirects to the user's first assigned but unresolved ticket.
    If none exist, redirects to the first unassigned ticket.
    """
    ticket = Ticket.query.filter(
        Ticket.helper_id == current_user.id,
        Ticket.status == TicketStatus.assigned).first()
    if ticket:
        return redirect(url_for('ticket', ticket_id=ticket.id))
    ticket = Ticket.query.filter(
        Ticket.status == TicketStatus.pending).first()
    if ticket:
        return redirect(url_for('ticket', ticket_id=ticket.id))
    return redirect(url_for('index'))

@app.route('/<int:ticket_id>/')
@login_required
def ticket(ticket_id):
    ticket = Ticket.query.get_or_404(ticket_id)
    if not current_user.is_staff and current_user.id != ticket.user_id:
        abort(404)
    return render_template('ticket.html', ticket=ticket,
                current_user=current_user, date=datetime.datetime.now())

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

# Caching

@app.after_request
def disable_caching(response):
    response.headers.add('Cache-Control',
        'no-cache, max-age=0, must-revalidate, no-store')
    return response
