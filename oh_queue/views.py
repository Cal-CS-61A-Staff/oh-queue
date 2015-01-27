from flask import render_template

from oh_queue import app
from oh_queue.entries.models import Entry
from oh_queue.entries import constants as ENTRY
from oh_queue.auth import requires_auth


@app.route("/")
def index():
    entries = Entry.query.filter_by(status=ENTRY.PENDING).order_by(Entry.add_date).all()
    return render_template('main.html', entries=entries)


@app.route("/assist")
@requires_auth
def assist():
    entries = Entry.query.filter_by(status=ENTRY.PENDING).order_by(Entry.add_date).all()
    return render_template('assist.html', entries=entries)


