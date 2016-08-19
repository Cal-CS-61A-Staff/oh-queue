import datetime

from flask_login import UserMixin
from flask_sqlalchemy import SQLAlchemy

from oh_queue.constants import TicketStatus, TicketEventType

db = SQLAlchemy()

class User(db.Model, UserMixin):
    __tablename__ = 'User'
    id = db.Column(db.Integer, primary_key=True)
    created = db.Column(db.DateTime, default=db.func.now())
    email = db.Column(db.String(255), nullable=False, index=True)

class Ticket(db.Model):
    """Represents an entry in the queue. A student submits a ticket and receives
    help from a staff member.
    """
    __tablename__ = 'Ticket'
    id = db.Column(db.Integer, primary_key=True)
    created = db.Column(db.DateTime, default=db.func.now())
    updated = db.Column(db.DateTime, onupdate=db.func.now())
    status = db.Column(db.SmallInteger, nullable=False, index=True)

    user_id = db.Column(db.ForeignKey('User.id'), nullable=False)
    body = db.Column(db.Text, nullable=False)

    helper_id = db.Column(db.ForeignKey('User.id'))

class TicketEvent(db.Model):
    """Represents an event that changes a ticket during its lifecycle."""
    __tablename__ = 'TicketEvent'
    id = db.Column(db.Integer, primary_key=True)
    time = db.Column(db.DateTime, default=db.func.now())
    event_type = db.Column(db.SmallInteger, nullable=False)
    ticket_id = db.Column(db.ForeignKey('Ticket.id'), nullable=False)
    user_id = db.Column(db.ForeignKey('User.id'), nullable=False)
