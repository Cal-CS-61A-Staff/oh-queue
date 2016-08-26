import os
basedir = os.path.abspath(os.path.dirname(__file__))

DEBUG = True

LOCAL_TIMEZONE = 'US/Pacific'

SQLALCHEMY_DATABASE_URI = 'sqlite:///' + os.path.join(basedir, 'app.db')
SQLALCHEMY_TRACK_MODIFICATIONS = False
DATABASE_CONNECT_OPTIONS = {}

SECRET_KEY = 'dev'

OK_KEY = 'oh-queue'
OK_SECRET = 'M05dGkt1xe1a1OJvG06YRITzAqQQvEa'

COURSE_OFFERING = 'cal/cs61a/fa16'
