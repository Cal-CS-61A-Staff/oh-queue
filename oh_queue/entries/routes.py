from oh_queue import app, db, socketio
from flask import request, jsonify

from datetime import datetime
from pytz import timezone

from oh_queue.entries.models import Entry
from oh_queue.entries import constants as ENTRY



@app.route('/add_entry', methods=['POST'])
def add_entry():
	"""Stores a new entry to the persistent database, and emits it to all
	connected clients.
	"""
	# Extract attributes from the POST request
	name = request.form['name']
	login = request.form['login']
	assignment = request.form['assignment']
	question = request.form['question']

	# Create a new entry and add it to persistent storage
	new_entry = Entry(name, login, assignment, question)
	db.session.add(new_entry)
	db.session.commit()

	# Emit the new entry to all clients
	payload = {
		'id': new_entry.id, 
		'name': new_entry.name, 
		'login': new_entry.login, 
		'add_date': format_datetime(new_entry.add_date), 
		'assignment': new_entry.assignment, 
		'question': new_entry.question
	}
	socketio.emit('add_entry_response', payload)
	return jsonify(result='success')



@app.route('/resolve_entry', methods=['POST'])
def resolve_entry():
	entry_id = request.form('id')
	helper = request.form['helper']

	resolved_entry = Entry.query.get(entry_id)
	resolved_entry.helper = helper
	resolved_entry.status = ENTRY.RESOLVED
	db.session.commit()

	socketio.emit('resolve_entry_response', payload)
	return jsonify(result='success')


# Filters

db_timezone = timezone(app.config['DB_TIMEZONE'])
local_timezone = timezone(app.config['LOCAL_TIMEZONE'])

@app.template_filter('datetime')
def format_datetime(timestamp):
	tz_aware = db_timezone.localize(timestamp)
	return tz_aware.astimezone(local_timezone).strftime('%I:%M %p')


