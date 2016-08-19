import datetime

from flask import render_template
from flask_login import login_required

from oh_queue import app
from oh_queue.models import Entry
from oh_queue import constants as ENTRY

@app.route("/")
def index():
    entries = Entry.query.filter_by(status=ENTRY.PENDING).order_by(Entry.add_date).all()
    return render_template('main.html', entries=entries, date=datetime.datetime.now())


@app.route("/assist")
@login_required
def assist():
    entries = Entry.query.filter_by(status=ENTRY.PENDING).order_by(Entry.add_date).all()
    return render_template('assist.html', entries=entries, date=datetime.datetime.now())
