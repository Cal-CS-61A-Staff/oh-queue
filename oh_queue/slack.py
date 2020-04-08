import threading

import requests
from apscheduler.schedulers.background import BackgroundScheduler


def worker(config):
    requests.post("https://auth.apps.cs61a.org/slack/post_message", json={
        "client_name": config["AUTH_KEY"],
        "secret": config["AUTH_SECRET"],
        "message": "This message is a test and will be posted on a loop",
        "purpose": "oh-queue-test"
    })


def fire_thread(config):
    threading.Thread(target=worker, args=(config,)).start()


def start_flask_job(app):
    scheduler = BackgroundScheduler()
    scheduler.add_job(func=fire_thread, args=(app.config,), trigger="interval", seconds=10)
    scheduler.start()
