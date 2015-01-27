from oh_queue import db
from oh_queue.entries import constants as ENTRY

from datetime import datetime


class Entry(db.Model):
	"""Represents an entry in the queue. Each entry has a student name, their 
	class login, the assignment, and the question they have issues with. To 
	resolve an issue, a helper must be input (TA, lab assistant, etc.)
	"""
	__tablename__ = 'entries_entry'
	id = db.Column(db.Integer, primary_key=True)
	name = db.Column(db.String(120))
	login = db.Column(db.String(10))

	assignment = db.Column(db.String(120))
	question = db.Column(db.SmallInteger)
	status = db.Column(db.SmallInteger, default=ENTRY.PENDING)

	helper = db.Column(db.String(120), default=None)
	add_date = db.Column(db.DateTime)
	resolved_date = db.Column(db.DateTime)
	resolved_notes = db.Column(db.Text)

	def __init__(self, name='Anonymous', login='cs61a-xx', assignment=None, question=1):
		self.name = name
		self.login = login

		self.assignment = assignment
		self.question = question

		self.add_date = datetime.utcnow()


	def get_status(self):
		return ENTRY.STATUS[self.status]

	def resolve(self):
		self.status = ENTRY.RESOLVED
		self.resolved_date = datetime.utcnow()

	def __repr__(self):
		return '<Entry from {}>'.format(self.login)

