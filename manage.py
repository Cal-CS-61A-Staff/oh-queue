#!/usr/bin/env python3
from flask_script import Manager

from oh_queue import app, socketio
from oh_queue.models import db, Ticket, User, TicketStatus

manager = Manager(app)

@manager.command
def seed():
    print('Seeding...')
    for i in range(20):
        name, email = "Oski Bear {}".format(i), "test{}@cs61a.org".format(i)
        student = User.query.filter_by(email=email).one_or_none()
        if not student:
            student = User(name=name, email=email)
            db.session.add(student)
            db.session.commit()

        ticket = Ticket(user=student, status=TicketStatus.pending,
                        assignment='Hog', question=5,
                        location='Soda')
        db.session.add(ticket)
        db.session.commit()


@manager.command
def resetdb():
    print('Dropping tables...')
    db.drop_all(app=app)
    print('Creating tables...')
    db.create_all(app=app)
    seed()

@manager.command
def server():
    socketio.run(app)

if __name__ == '__main__':
    manager.run()
