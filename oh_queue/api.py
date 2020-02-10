from flask import jsonify
from oh_queue.models import Ticket

def get_tickets():
    tickets = Ticket.query.all()
    return jsonify(tickets=[i.serialize for i in tickets])

def get_ticket(ticket_id):
    tickets = Ticket.query.filter_by(id = ticket_id)
    return jsonify(tickets=[i.serialize for i in tickets])
