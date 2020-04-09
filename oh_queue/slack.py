import atexit
import threading
from datetime import timedelta, datetime

import requests
from apscheduler.schedulers.background import BackgroundScheduler

from oh_queue.course_config import COURSE_DOMAINS
from oh_queue.models import (
    Ticket,
    TicketStatus,
    Appointment,
    get_current_time,
    AppointmentStatus,
    db,
)

pinged_appointments = set()
alerted_appointments = set()
last_queue_ping = {}


def worker(app):
    with app.app_context():
        for course, domain in COURSE_DOMAINS.items():
            def send(message):
                requests.post(
                    "https://auth.apps.cs61a.org/slack/post_message",
                    json={
                        "client_name": app.config["AUTH_KEY"],
                        "secret": app.config["AUTH_SECRET"],
                        "message": message,
                        "purpose": "oh-queue-test",
                        "course": course,
                    },
                )

            # check for overlong queue
            if course not in last_queue_ping or datetime.now() - last_queue_ping[course] > timedelta(hours=8):
                queue_len = Ticket.query.filter_by(
                    course=course, status=TicketStatus.pending
                ).count()
                if queue_len > 20:
                    send(
                        "<!channel> The OH queue currently has more than {} students waiting. "
                        "If you can, please drop by and help! Go to the <{}|OH Queue> to see more.".format(queue_len, domain)
                    )
                last_queue_ping[course] = datetime.now()

            # check for appointments that should have started
            appointments = Appointment.query.filter(
                Appointment.start_time < get_current_time() + timedelta(minutes=1),
                Appointment.status == AppointmentStatus.pending,
                Appointment.course == course,
            ).all()

            for appointment in appointments:
                if appointment.id in alerted_appointments:
                    continue
                if len(appointment.signups) > 0:
                    if appointment.helper:
                        if appointment.id not in pinged_appointments:
                            send(
                                "<!{email}> You have an appointment right now that hasn't started, and students are "
                                "waiting! Your appointment is {location}. Go to the <{queue_url}|OH Queue> to see more "
                                "information.".format(
                                    email=appointment.helper.email,
                                    location="*Online*"
                                    if appointment.location.name == "Online"
                                    else "at *{}*".format(appointment.location.name),
                                    queue_url=domain,
                                )
                            )
                            pinged_appointments.add(appointment.id)
                        else:
                            send(
                                "<!channel> {name}'s appointment is right now but hasn't started, and students are "
                                "waiting! The appointment is {location}. Can anyone available help out? "
                                "Go to the <{queue_url}|OH Queue> to see more information.".format(
                                    name=appointment.helper.name,
                                    location="*Online*"
                                    if appointment.location.name == "Online"
                                    else "at *{}*".format(appointment.location.name),
                                    queue_url=domain,
                                )
                            )
                            alerted_appointments.add(appointment.id)
                    else:
                        send(
                            "<!channel> An appointment is scheduled for right now that hasn't started, and students "
                            "are waiting! *No staff member has signed up for it!* The appointment is {location}. "
                            "Go to the <{queue_url}|OH Queue> to see more information.".format(
                                location="*Online*"
                                if appointment.location.name == "Online"
                                else "at *{}*".format(appointment.location.name),
                                queue_url=domain,
                            )
                        )
                        alerted_appointments.add(appointment.id)
                else:
                    if appointment.helper:
                        send(
                            "<!{email}> You have an appointment right now that hasn't started, but no students have "
                            "signed up. I am automatically resolving the appointment - consider helping out in "
                            "drop-in OH instead!".format(email=appointment.helper.email)
                        )
                    else:
                        send(
                            "An appointment is scheduled right now that hasn't started, but no students have "
                            "signed up *and no staff member was assigned*. I am automatically resolving the "
                            "appointment. Be careful - a student _could_ have signed up since the appointment "
                            "wasn't hidden."
                        )
                    appointment.status = AppointmentStatus.resolved
        db.session.commit()


def fire_thread(app):
    threading.Thread(target=worker, args=(app,)).start()


def start_flask_job(app):
    scheduler = BackgroundScheduler()
    scheduler.add_job(func=fire_thread, args=(app,), trigger="interval", seconds=10)
    scheduler.start()
    atexit.register(lambda: scheduler.shutdown())


def test(app):
    worker(app)
    pass
