from gevent import monkey
monkey.patch_all()

import logging
logging.basicConfig(level=logging.INFO)


# Flask-related stuff
from flask import Flask
from flask.ext.socketio import SocketIO
from flask.ext.sqlalchemy import SQLAlchemy


# Initialize the application
app = Flask(__name__)
app.config.from_object('config')

db = SQLAlchemy(app)
socketio = SocketIO(app)


# Import views
import oh_queue.views
import oh_queue.sockets


# Import routes
import oh_queue.entries.routes


