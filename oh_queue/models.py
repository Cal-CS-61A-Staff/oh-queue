import datetime
import enum

from flask_login import UserMixin
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class User(db.Model, UserMixin):
    __tablename__ = 'User'
    id = db.Column(db.Integer, primary_key=True)
    created = db.Column(db.DateTime, default=db.func.now())
    email = db.Column(db.String(255), nullable=False, index=True)

class TicketStatus(enum.IntEnum):
    pending = 0
    assigned = 1
    resolved = 2
    canceled = 3

class Ticket(db.Model):
    """Represents an ticket in the queue. A student submits a ticket and receives
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

class TicketEventType(enum.IntEnum):
    create = 0
    assign = 1
    unassign = 2
    resolve = 3
    cancel = 4

class TicketEvent(db.Model):
    """Represents an event that changes a ticket during its lifecycle."""
    __tablename__ = 'TicketEvent'
    id = db.Column(db.Integer, primary_key=True)
    time = db.Column(db.DateTime, default=db.func.now())
    event_type = db.Column(db.SmallInteger, nullable=False)
    ticket_id = db.Column(db.ForeignKey('Ticket.id'), nullable=False)
    user_id = db.Column(db.ForeignKey('User.id'), nullable=False)
