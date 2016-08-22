from gevent import monkey
monkey.patch_all()

import logging
logging.basicConfig(level=logging.INFO)


# Flask-related stuff
from flask import Flask
from flask_socketio import SocketIO

from oh_queue import auth
from oh_queue.models import db

# Initialize the application
app = Flask(__name__)
app.config.from_object('config')

db.init_app(app)
auth.init_app(app)
socketio = SocketIO(app)


# Import views
import oh_queue.views
