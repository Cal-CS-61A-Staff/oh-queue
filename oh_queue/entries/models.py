from oh_queue import db
from oh_queue.entries import constants as ENTRY

from datetime import datetime

class SessionPassword(db.Model):
	"""
	A session password so that students must be present to put their names on the queue.
	"""
	__tablename__ = 'session_password'
	id = db.Column(db.Integer, primary_key=True)
	password = db.Column(db.String(120))

	def __init__(self, password):
		self.password = password

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
	add_date = db.Column(db.DateTime)
	resolved_date = db.Column(db.DateTime)
	resolved_notes = db.Column(db.Text)

	def __init__(self, name='Anonymous', sid='24616161', location=None,
				 assignment_type=None, assignment=None, question=None):
		self.name = name
		self.sid = sid

		self.location = location
		self.assignment_type = assignment_type
		self.assignment = assignment
		self.question = question

		self.add_date = datetime.utcnow()


	def get_status(self):
		return ENTRY.STATUS[self.status]

	def resolve(self):
		self.status = ENTRY.RESOLVED
		self.resolved_date = datetime.utcnow()

	def __repr__(self):
		return '<Entry from {}>'.format(self.name)

