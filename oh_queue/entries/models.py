from oh_queue import db
from oh_queue.entries import constants as ENTRY

from datetime import datetime

class Entry(db.Model):
    """Represents an entry in the queue. Each entry has a student name, their
    SID, the assignment, and the question they have issues with. To
    resolve an issue, a helper must be input (TA, lab assistant, etc.)
    """
    __tablename__ = 'entries_entry'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120))
    sid = db.Column(db.Integer)

    location = db.Column(db.String(120))
    assignment_type = db.Column(db.String(120))
    assignment = db.Column(db.SmallInteger)
    question = db.Column(db.SmallInteger)
    status = db.Column(db.SmallInteger, default=ENTRY.PENDING)

    helper = db.Column(db.String(120), default=None)
    add_date = db.Column(db.DateTime, default=db.func.now())
    resolved_date = db.Column(db.DateTime)
    resolved_notes = db.Column(db.Text)

    def get_status(self):
        return ENTRY.STATUS[self.status]

    def resolve(self):
        self.status = ENTRY.RESOLVED
        self.resolved_date = datetime.utcnow()

    def __repr__(self):
        return '<Entry from {}>'.format(self.name)
