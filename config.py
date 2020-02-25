import os
basedir = os.path.abspath(os.path.dirname(__file__))

ENV = os.getenv('OH_QUEUE_ENV', 'dev')

if ENV in ('dev', 'staging'):
    DEBUG = True
elif ENV == 'prod':
    DEBUG = False

if ENV == 'dev':
    SECRET_KEY = 'dev'
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'sqlite:///' + os.path.join(basedir, 'app.db')).replace('mysql://', 'mysql+pymysql://')
else:
    SECRET_KEY = os.getenv('SECRET_KEY')
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL').replace('mysql://', 'mysql+pymysql://')

SQLALCHEMY_TRACK_MODIFICATIONS = False
DATABASE_CONNECT_OPTIONS = {}

LOCAL_TIMEZONE = os.getenv('TIMEZONE', 'US/Pacific')

OK_KEY = os.getenv('OK_KEY', 'local-dev-email')
OK_SECRET = os.getenv('OK_SECRET', 'KH0mvknMUWT5w3U7zvz6wsUQZoy6UmQ')

OK_SERVER_URL = os.getenv('OK_DEPLOYMENT', 'https://okpy.org')

COURSE_OFFERING = os.getenv('COURSE_OFFERING', 'ok/test/su16')
COURSE_NAME = os.getenv('COURSE_NAME', 'OK')

HOST = os.getenv('HOST', '127.0.0.1')
PORT = int(os.getenv('PORT', '5000'))
