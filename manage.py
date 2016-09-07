#!/usr/bin/env python3
from flask_script import Manager

from oh_queue import app, models, socketio
from oh_queue.models import db

manager = Manager(app)

@manager.command
def resetdb():
    print('Dropping tables...')
    db.drop_all(app=app)
    print('Creating tables...')
    db.create_all(app=app)
    print('Seeding...')
    for i in range(100):
        user = models.User(
            name='Student McGee',
            email='student{}@berkeley.edu'.format(i),
            is_staff=False,
        )
        ticket = models.Ticket(
            status=models.TicketStatus.pending,
            user=user,
            assignment='Scheme',
            question='13',
            location='190 Morgan Hall',
        )
        db.session.add(user)
        db.session.add(ticket)
    db.session.commit()

@manager.command
def server():
    socketio.run(app)

if __name__ == '__main__':
    manager.run()
