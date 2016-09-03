import logging
logging.basicConfig(level=logging.INFO)


# Flask-related stuff
from flask import Flask, request
from flask_socketio import SocketIO

from oh_queue import assets, auth
from oh_queue.models import db, TicketStatus

# Initialize the application
app = Flask(__name__)
app.config.from_object('config')

app.jinja_env.globals.update({
  'TicketStatus': TicketStatus,
  'assets_env': assets.assets_env,
})

db.init_app(app)
auth.init_app(app)
socketio = SocketIO(app)

# Import views
import oh_queue.views

# Caching
@app.after_request
def after_request(response):
    if request.path.startswith('/static'):
        cache_control = 'max-age=31556926'
    else:
        cache_control = 'no-store'
    response.headers.add('Cache-Control', cache_control)
    return response
