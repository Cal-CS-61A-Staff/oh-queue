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
app.config.update({
    'DEBUG': True,
    'SQLALCHEMY_TRACK_MODIFICATIONS': False,
})

db.init_app(app)
auth.init_app(app)
socketio = SocketIO(app)


# Import views
import oh_queue.views
