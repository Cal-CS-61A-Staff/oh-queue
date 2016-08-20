from flask import Blueprint, abort, redirect, render_template, url_for

from oh_queue.models import db, User

assist = Blueprint('assist', __name__)

@assist.route('/')
def index():
    show_assigned = request.args.get('show_assigned', False)
    tickets = pending_tickets()
    return render_template('assist.html', tickets=tickets)

@assist.route('/start/', methods=['POST'])
def start(ticket_id):
    pass

@assist.route('/tickets/<hashid:ticket_id>/')
def ticket(ticket_id):
    pass

@assist.route('/tickets/<hashid:ticket_id>/assign/', methods=['POST'])
def assign(ticket_id):
    pass

@assist.route('/tickets/<hashid:ticket_id>/unassign/', methods=['POST'])
def unassign(ticket_id):
    assign_next = request.args.get('next', False)
    pass

@assist.route('/tickets/<hashid:ticket_id>/resolve/', methods=['POST'])
def resolve(ticket_id):
    assign_next = request.args.get('next', False)
    pass

def init_app(app):
    app.register_blueprint(assist, url_prefix='/assist')
