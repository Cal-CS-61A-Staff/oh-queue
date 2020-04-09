import re

import requests
from cachetools import TTLCache
from flask import request, g
from flask_login import current_user

from oh_queue import app

DOMAIN_COURSES = TTLCache(1000, 1800)
COURSE_ENDPOINTS = TTLCache(1000, 1800)
ENDPOINT_ID = TTLCache(1000, 1800)

COURSE_DOMAINS = {"ok": "oh.cs61a.org"}


def get_course(domain=None):
    if app.config["ENV"] != "prod":
        return "ok"
    if not domain:
        domain = request.headers["HOST"]
    if domain not in DOMAIN_COURSES:
        DOMAIN_COURSES[domain] = requests.post("https://auth.apps.cs61a.org/domains/get_course", json={
            "domain": domain
        }).json()
    COURSE_DOMAINS[DOMAIN_COURSES[domain]] = domain
    return DOMAIN_COURSES[domain]


def get_endpoint(course=None):
    if app.config["ENV"] != "prod":
        return "ok/test/su16"
    if not course:
        course = get_course()
    if course not in COURSE_ENDPOINTS:
        COURSE_ENDPOINTS[course] = requests.post("https://auth.apps.cs61a.org/api/{}/get_endpoint".format(course)).json()
    return COURSE_ENDPOINTS[course]


def get_course_id(course=None):
    if app.config["ENV"] != "prod":
        return 1
    if not course:
        course = get_course()
    if course not in ENDPOINT_ID:
        ENDPOINT_ID[course] = requests.post("https://auth.apps.cs61a.org/api/{}/get_endpoint_id".format(course)).json()
    return ENDPOINT_ID[course]


def is_admin(course=None):
    if app.config["ENV"] != "prod":
        return True
    if not course:
        course = get_course()
    if g.get("is_admin") is None:
        g.is_admin = requests.post("https://auth.apps.cs61a.org/admins/{}/is_admin".format(course), json={
            "email": current_user.email,
            "course": "cs61a",
            "client_name": app.config["AUTH_KEY"],
            "secret": app.config["AUTH_SECRET"],
        }).json()
    return g.is_admin


def format_coursecode(course):
    m = re.match(r"([a-z]+)([0-9]+[a-z]?)", course)
    return m and (m.group(1) + " " + m.group(2)).upper()
