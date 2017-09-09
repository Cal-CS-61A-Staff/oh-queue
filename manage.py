#!/usr/bin/env python3
import datetime
import functools
import random
import sys

from flask_migrate import Migrate, MigrateCommand
from flask_script import Manager
import names

from oh_queue import app, socketio
from oh_queue.models import db, Ticket, User, TicketStatus

migrate = Migrate(app, db)

manager = Manager(app)
manager.add_command('db', MigrateCommand)

def not_in_production(f):
    @functools.wraps(f)
    def wrapper(*args, **kwargs):
        if app.config.get('ENV') == 'prod':
            print('this commend should not be run in production. Aborting')
            sys.exit(1)
        return f(*args, **kwargs)
    return wrapper

@manager.command
@not_in_production
def seed():
    print('Seeding...')
    for i in range(20):
        real_name = names.get_full_name()
        first_name, last_name = real_name.lower().split(' ')
        email = '{0}{1}@{2}'.format(
            random.choice([first_name, first_name[0]]),
            random.choice([last_name, last_name[0]]),
            random.choice(['berkeley.edu', 'gmail.com']),
        )
        student = User.query.filter_by(email=email).one_or_none()
        if not student:
            student = User(name=real_name, email=email)
            db.session.add(student)
            db.session.commit()
        delta = datetime.timedelta(minutes=random.randrange(0, 30))
        ticket = Ticket(
            user=student,
            status=TicketStatus.pending,
            created=datetime.datetime.utcnow() - delta,
            assignment=random.choice(['Hog', 'Scheme']),
            description=random.choice(['', 'SyntaxError on Line 5']),
            question=random.randrange(1, 6),
            location=random.choice(['109 Morgan', '247 Cory']),
        )
        db.session.add(ticket)
        db.session.commit()


@manager.command
@not_in_production
def resetdb():
    print('Dropping tables...')
    db.drop_all(app=app)
    print('Creating tables...')
    db.create_all(app=app)
    seed()

@manager.command
@not_in_production
def server():
    socketio.run(app)

if __name__ == '__main__':
    manager.run()
