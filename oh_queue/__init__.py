from gevent import monkey
monkey.patch_all()

import logging
logging.basicConfig(level=logging.INFO)


# Flask-related stuff
from flask import Flask
from flask_socketio import SocketIO
from flask_sqlalchemy import SQLAlchemy

from oh_queue.auth import auth

# Initialize the application
app = Flask(__name__)
app.config.from_object('config')
app.config.update({
    'DEBUG': True,
    'SQLALCHEMY_TRACK_MODIFICATIONS': False,
})

app.register_blueprint(auth)

db = SQLAlchemy(app)
socketio = SocketIO(app)


# Import views
import oh_queue.views

# Import routes
import oh_queue.routes
