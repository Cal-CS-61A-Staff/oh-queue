import atexit
import threading

import requests
from apscheduler.schedulers.background import BackgroundScheduler

from oh_queue.models import Ticket, TicketStatus


def worker(app):
    with app.app_context():
        students = [t.name for t in Ticket.query.filter_by(course="cs61a", status=TicketStatus.pending).all()]
        message = "This is a test to see if a worker thread can access the database. " \
                  "There are currently {} students on the 61A queue. They are {}.".format(len(students), ", ".join(students))
        requests.post("https://auth.apps.cs61a.org/slack/post_message", json={
            "client_name": app.config["AUTH_KEY"],
            "secret": app.config["AUTH_SECRET"],
            "message": message,
            "purpose": "oh-queue-test",
            "course": "cs61a",
        })


def fire_thread(app):
    threading.Thread(target=worker, args=(app,)).start()


def start_flask_job(app):
    scheduler = BackgroundScheduler()
    scheduler.add_job(func=fire_thread, args=(app,), trigger="interval", seconds=10)
    scheduler.start()
    atexit.register(lambda: scheduler.shutdown())

