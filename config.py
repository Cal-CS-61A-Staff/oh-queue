import os
basedir = os.path.abspath(os.path.dirname(__file__))

ENV = os.getenv('OH_QUEUE_ENV', 'dev')

DEBUG = ENV in ('dev', 'staging')

SECRET_KEY = os.getenv('SECRET_KEY')
SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL').replace('mysql://', 'mysql+pymysql://')
if ENV == 'dev':
    SECRET_KEY = SECRET_KEY or 'dev'
    SQLALCHEMY_DATABASE_URI = SQLALCHEMY_DATABASE_URI or 'sqlite:///' + os.path.join(basedir, 'app.db')

SQLALCHEMY_TRACK_MODIFICATIONS = False
DATABASE_CONNECT_OPTIONS = {}

LOCAL_TIMEZONE = 'US/Pacific'

OK_KEY = 'oh-queue'
OK_SECRET = 'M05dGkt1xe1a1OJvG06YRITzAqQQvEa'

OK_SERVER_URL = 'https://okpy.org'
COURSE_OFFERING = 'cal/cs61a/fa16'
