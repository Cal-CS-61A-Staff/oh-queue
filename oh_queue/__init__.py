import logging
logging.basicConfig(level=logging.INFO)


# Flask-related stuff
from flask import Flask
from flask_socketio import SocketIO

from oh_queue import auth
from oh_queue.models import db, TicketStatus
from raven.contrib.flask import Sentry

# Initialize the application
app = Flask(__name__)
app.config.from_object('config')

if not app.debug:
    sentry = Sentry(app,
                    dsn='https://d5dd390197e84e3ebb4779ab381610a0:ccac76da30704fa7a352a9ec3bd1708f@sentry.cs61a.org/14')

app.jinja_env.globals.update({
  'TicketStatus': TicketStatus
})

db.init_app(app)
auth.init_app(app)
socketio = SocketIO(app)


# Import views
import oh_queue.views
