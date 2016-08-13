from oh_queue import app, db, socketio
from flask import request, jsonify

from datetime import datetime
from pytz import timezone

from oh_queue.entries.models import Entry
from oh_queue.entries import constants as ENTRY

from oh_queue.auth import requires_admin

def return_payload(entry):
    return {
        'id': entry.id,
        'name': entry.name,
        'sid': entry.sid,
        'add_date': format_datetime(entry.add_date),
        'location': entry.location,
        'assignment_type':entry.assignment_type,
        'assignment':entry.assignment,
        'question': entry.question
    }

@app.route('/add_entry', methods=['POST'])
def add_entry():
    """Stores a new entry to the persistent database, and emits it to all
    connected clients.
    """
    # Create a new entry and add it to persistent storage
    entry = Entry(
        name=request.form['name'],
        sid=request.form['sid'],
        location=request.form['location'],
        assignment_type=request.form['assignment_type'],
        assignment=request.form['assignment'],
        question=request.form['question'],
    )
    db.session.add(entry)
    db.session.commit()

    # Emit the new entry to all clients
    socketio.emit('add_entry_response', return_payload(entry))
    return jsonify(result='success')

@app.route('/view_entries', methods=['GET'])
def view_entries():
    results = Entry.query.all()
    return jsonify(results)


@app.route('/resolve_entry', methods=['POST'])
def resolve_entry():
    entry_id = request.form['id']
    # helper = request.form['helper']

    resolved_entry = Entry.query.get(entry_id)
    # resolved_entry.helper = helper
    resolved_entry.resolve()
    db.session.commit()

    socketio.emit('resolve_entry_response', return_payload(resolved_entry))
    return jsonify(result='success')

@app.route('/add_notes', methods=['POST'])
def add_notes():
    entry_id = request.form['id']
    notes = request.form['notes']

    entry = Entry.query.get(entry_id)
    entry.resolved_notes = notes
    db.session.commit()
    socketio.emit('notes_added', {
        "id": entry_id,
        "notes": notes
        })
    return jsonify(result='success')

"""
This route should be accessed at the end of office hours.
All resolved entries currently in the database will be cleared out.
The data (without names) will then be returned.
"""
@app.route('/generate_report', methods=['GET'])
@requires_admin
def generate_report():
    resolved = Entry.query.filter_by(status=ENTRY.RESOLVED).all()
    data_list = {}
    for i in range(len(resolved)):
        request = resolved[i]
        data_list[i] = {
            # "name": request.name,
            # The data we get should be anonymized
            "assignment": request.assignment,
            "question": request.question,
            "add_date": request.add_date,
            "resolved_date": request.resolved_date,
            "resolved_notes": request.resolved_notes,
            }
        db.session.delete(request)
        db.session.commit()
    return jsonify(data_list)

# Filters

db_timezone = timezone(app.config['DB_TIMEZONE'])
local_timezone = timezone(app.config['LOCAL_TIMEZONE'])

@app.template_filter('datetime')
def format_datetime(timestamp):
    tz_aware = db_timezone.localize(timestamp)
    return tz_aware.astimezone(local_timezone).strftime('%I:%M %p')
