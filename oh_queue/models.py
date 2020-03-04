import enum

from flask_login import UserMixin
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class EnumType(db.TypeDecorator):
    impl = db.String(255)

    def __repr__(self):
        """ Make alembic detect the right type """
        return 'db.String(length=255)'

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
    is_staff = db.Column(db.Boolean, default=False)

    @property
    def short_name(self):
        first_name = self.name.split()[0]
        if '@' in first_name:
            return first_name.rsplit('@')[0]
        return first_name

class ConfigEntry(db.Model):
    """Represents persistent server-side configuration entries"""
    __tablename__ = 'config_entries'
    key = db.Column(db.String(255), primary_key=True)
    value = db.Column(db.Text(), nullable=False)
    public = db.Column(db.Boolean, default=False)

class Assignment(db.Model):
    """Represents a ticket's assignment."""
    __tablename__ = 'assignment'
    id = db.Column(db.Integer, primary_key=True)
    created = db.Column(db.DateTime, default=db.func.now())
    name = db.Column(db.String(255), nullable=False, unique=True)
    visible = db.Column(db.Boolean, default=False)

class Location(db.Model):
    """Represents a ticket's location."""
    __tablename__ = 'location'
    id = db.Column(db.Integer, primary_key=True)
    created = db.Column(db.DateTime, default=db.func.now())
    name = db.Column(db.String(255), nullable=False, unique=True)
    visible = db.Column(db.Boolean, default=False)

TicketStatus = enum.Enum('TicketStatus', 'pending assigned resolved deleted juggled rerequested')

active_statuses = [TicketStatus.pending, TicketStatus.assigned, TicketStatus.juggled, TicketStatus.rerequested]

class Ticket(db.Model):
    """Represents an ticket in the queue. A student submits a ticket and receives
    help from a staff member.
    """
    __tablename__ = 'ticket'
    id = db.Column(db.Integer, primary_key=True)
    created = db.Column(db.DateTime, default=db.func.now(), index=True)
    updated = db.Column(db.DateTime, onupdate=db.func.now())
    status = db.Column(EnumType(TicketStatus), nullable=False, index=True)

    rerequest_threshold = db.Column(db.DateTime)  # time when student allowed to re-request help
    hold_time = db.Column(db.DateTime)  # time when student was put on hold
    rerequest_time = db.Column(db.DateTime)  # time when student re-requested help

    user_id = db.Column(db.ForeignKey('user.id'), nullable=False, index=True)
    helper_id = db.Column(db.ForeignKey('user.id'), index=True)

    assignment_id = db.Column(db.ForeignKey('assignment.id'), nullable=False, index=True)
    location_id = db.Column(db.ForeignKey('location.id'), nullable=False, index=True)
    question = db.Column(db.String(255), nullable=False)

    description = db.Column(db.Text)

    user = db.relationship(User, foreign_keys=[user_id])
    helper = db.relationship(User, foreign_keys=[helper_id])
    assignment = db.relationship(Assignment, foreign_keys=[assignment_id])
    location = db.relationship(Location, foreign_keys=[location_id])

    @classmethod
    def for_user(cls, user):
        if user and user.is_authenticated:
            return cls.query.filter(
              cls.user_id == user.id,
              cls.status.in_([TicketStatus.pending, TicketStatus.assigned]),
            ).one_or_none()

    @classmethod
    def by_status(cls, status=None):
        """ Tickets in any of the states as status.
        @param status: Iterable containing TicketStatus values
        """
        if status is None:
            status = [TicketStatus.pending, TicketStatus.assigned]
        return cls.query.filter(
           cls.status.in_(status)
        ).order_by(cls.created).all()

TicketEventType = enum.Enum(
    'TicketEventType',
    'create assign unassign resolve delete update juggle rerequest return_to hold_released',
)

class TicketEvent(db.Model):
    """Represents an event that changes a ticket during its lifecycle."""
    __tablename__ = 'ticket_event'
    id = db.Column(db.Integer, primary_key=True)
    time = db.Column(db.DateTime, default=db.func.now())
    event_type = db.Column(EnumType(TicketEventType), nullable=False)
    ticket_id = db.Column(db.ForeignKey('ticket.id'), nullable=False)
    user_id = db.Column(db.ForeignKey('user.id'), nullable=False)

    ticket = db.relationship(Ticket)
    user = db.relationship(User)


class Appointment(db.Model):
    """Represents an appointment block."""
    __tablename__ = "appointment"
    id = db.Column(db.Integer, primary_key=True)
    start_time = db.Column(db.DateTime, index=True, nullable=False)
    duration = db.Column(db.Interval, nullable=False)
    capacity = db.Column(db.Integer, nullable=False)

    location_id = db.Column(db.ForeignKey('location.id'), nullable=False, index=True)
    location = db.relationship(Location, foreign_keys=[location_id])

    helper_id = db.Column(db.ForeignKey('user.id'), index=True)
    helper = db.relationship(User, foreign_keys=[helper_id])

    signups = db.relationship("AppointmentSignup", back_populates="appointment")


class AppointmentSignup(db.Model):
    __tablename__ = "appointment_signup"
    id = db.Column(db.Integer, primary_key=True)

    appointment_id = db.Column(db.ForeignKey('appointment.id'), nullable=False, index=True)
    appointment = db.relationship("Appointment", back_populates="signups")

    user_id = db.Column(db.ForeignKey('user.id'), nullable=False, index=True)
    user = db.relationship(User, foreign_keys=[user_id])

    assignment_id = db.Column(db.ForeignKey('assignment.id'), nullable=False, index=True)
    assignment = db.relationship(Assignment, foreign_keys=[assignment_id])

    question = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
