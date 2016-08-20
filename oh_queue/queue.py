from flask import Blueprint, abort, redirect, render_template, url_for

from oh_queue.models import db, User

queue = Blueprint('queue', __name__)

@queue.route('/')
def index():
    tickets = pending_tickets()
    return render_template('main.html', tickets=tickets)

@queue.route('/tickets/create/', methods=['GET', 'POST'])
def create():
    pass

@queue.route('/tickets/<hashid:ticket_id>/')
def ticket(ticket_id):
    pass

@queue.route('/tickets/<hashid:ticket_id>/cancel/', methods=['POST'])
def cancel(ticket_id):
    pass

@queue.route('/tickets/<hashid:ticket_id>/resolve/', methods=['POST'])
def resolve(ticket_id):
    pass

@queue.route('/tickets/<hashid:ticket_id>/rate/', methods=['GET', 'POST'])
def rate(ticket_id):
    pass

def init_app(app):
    app.register_blueprint(queue, url_prefix='/queue')
