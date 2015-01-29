import os
_basedir = os.path.abspath(os.path.dirname(__file__))

DEBUG = False

DB_TIMEZONE = 'UTC'
LOCAL_TIMEZONE = 'America/Los_Angeles'


#SQLALCHEMY_DATABASE_URI = 'sqlite:////tmp/test.db'
SQLALCHEMY_DATABASE_URI = 'sqlite:///' + os.path.join(_basedir, 'app.db')
DATABASE_CONNECT_OPTIONS = {}

SECRET_KEY = 'oE3<EX.-x(k/9Y9GS=B{tNW~`EY<Yj[xO<h]1k68Ro}???U]|8P+7+#.?OSiUF$*'
