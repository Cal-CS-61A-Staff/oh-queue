#!/usr/bin/env python3
from flask_script import Manager

from oh_queue import app, socketio
from oh_queue.models import db

manager = Manager(app)

@manager.command
def resetdb():
    print('Dropping tables...')
    db.drop_all(app=app)
    print('Creating tables...')
    db.create_all(app=app)

@manager.command
def server():
    socketio.run(app)

if __name__ == '__main__':
    manager.run()
