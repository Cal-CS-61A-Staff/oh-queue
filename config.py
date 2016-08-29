import os
basedir = os.path.abspath(os.path.dirname(__file__))

DEBUG = False if os.getenv('SECRET_KEY') else True

LOCAL_TIMEZONE = 'US/Pacific'

if DEBUG:
    SQLALCHEMY_DATABASE_URI = 'sqlite:///' + os.path.join(basedir, 'app.db')
else:
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL').replace('mysql://', 'mysql+pymysql://')
SQLALCHEMY_TRACK_MODIFICATIONS = False
DATABASE_CONNECT_OPTIONS = {}

SECRET_KEY = os.getenv('SECRET_KEY', 'dev')

OK_KEY = 'oh-queue'
OK_SECRET = 'M05dGkt1xe1a1OJvG06YRITzAqQQvEa'

OK_SERVER_URL = 'https://ok.cs61a.org'
COURSE_OFFERING = 'cal/cs61a/fa16'
