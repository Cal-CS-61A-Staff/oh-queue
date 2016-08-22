import datetime
import enum

from flask_login import UserMixin
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class EnumType(db.TypeDecorator):
    impl = db.String(255)

    def __init__(self, enum_class):
        super(EnumType, self).__init__(self)
        self.enum_class = enum_class

    def process_bind_param(self, enum_value, dialect):
        return enum_value.name

    def process_result_value(self, name, dialect):
        return self.enum_class[name]

    @property
    def python_type(self):
        return self.enum_class

class User(db.Model, UserMixin):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True)
    created = db.Column(db.DateTime, default=db.func.now())
    email = db.Column(db.String(255), nullable=False, index=True)
    name = db.Column(db.String(255), nullable=False)

TicketStatus = enum.Enum('TicketStatus', 'pending assigned resolved canceled')

class Ticket(db.Model):
    """Represents an ticket in the queue. A student submits a ticket and receives
    help from a staff member.
    """
    __tablename__ = 'ticket'
    id = db.Column(db.Integer, primary_key=True)
    created = db.Column(db.DateTime, default=db.func.now(), index=True)
    updated = db.Column(db.DateTime, onupdate=db.func.now())
    status = db.Column(EnumType(TicketStatus), nullable=False, index=True)

    user_id = db.Column(db.ForeignKey('user.id'), nullable=False, index=True)
    assignment = db.Column(db.String(255), nullable=False)
    question = db.Column(db.String(255), nullable=False)
    location = db.Column(db.String(255), nullable=False)

    helper_id = db.Column(db.ForeignKey('user.id'), index=True)

    user = db.relationship(User, foreign_keys=[user_id])
    helper = db.relationship(User, foreign_keys=[helper_id])

TicketEventType = enum.Enum(
    'TicketEventType',
    'create assign unassign resolve cancel',
)

class TicketEvent(db.Model):
    """Represents an event that changes a ticket during its lifecycle."""
    __tablename__ = 'ticket_event'
    id = db.Column(db.Integer, primary_key=True)
    time = db.Column(db.DateTime, default=db.func.now())
    event_type = db.Column(EnumType(TicketEventType), nullable=False)
    ticket_id = db.Column(db.ForeignKey('ticket.id'), nullable=False)
    user_id = db.Column(db.ForeignKey('user.id'), nullable=False)
