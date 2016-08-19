import datetime

from flask import render_template
from flask_login import login_required

from oh_queue import app
from oh_queue.models import Ticket, TicketStatus

def pending_tickets():
     return Ticket.query.filter_by(
        status=TicketStatus.pending,
    ).order_by(Ticket.created).all()

@app.route("/")
@login_required
def index():
    tickets = pending_tickets()
    return render_template('main.html', tickets=tickets, date=datetime.datetime.now())


@app.route("/assist")
@login_required
def assist():
    tickets = pending_tickets()
    return render_template('assist.html', tickets=tickets, date=datetime.datetime.now())
