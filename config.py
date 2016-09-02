import os
basedir = os.path.abspath(os.path.dirname(__file__))

ENV = os.getenv('ENV', 'dev')

if ENV == 'dev':
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///' + os.path.join(basedir, 'app.db')
elif ENV == 'test':
    TESTING = True
    LIVESERVER_PORT = 8943
    SQLALCHEMY_DATABASE_URI = 'sqlite:///' + os.path.join(basedir, 'test.db')
elif ENV == 'prod':
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL').replace('mysql://', 'mysql+pymysql://')

LOCAL_TIMEZONE = 'US/Pacific'

SQLALCHEMY_TRACK_MODIFICATIONS = False
DATABASE_CONNECT_OPTIONS = {}

SECRET_KEY = os.getenv('SECRET_KEY', 'dev')

OK_KEY = 'oh-queue'
OK_SECRET = 'M05dGkt1xe1a1OJvG06YRITzAqQQvEa'

OK_SERVER_URL = 'https://ok.cs61a.org'
COURSE_OFFERING = 'cal/cs61a/fa16'
