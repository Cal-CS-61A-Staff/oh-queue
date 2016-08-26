from flask import Blueprint, abort, redirect, render_template, request, session, url_for
from flask_login import LoginManager, login_user
from flask_oauthlib.client import OAuth, OAuthException

from werkzeug import security
import requests

from oh_queue.models import db, User

auth = Blueprint('auth', __name__)

OK_KEY = 'oh-queue'
OK_SECRET = 'M05dGkt1xe1a1OJvG06YRITzAqQQvEa'

COURSE_OFFERING = 'cal/cs61a/fa16'

oauth = OAuth()
ok_auth = oauth.remote_app(
    'ok-server',
    consumer_key=OK_KEY,
    consumer_secret=OK_SECRET,
    request_token_params={
        'scope': 'all',
        'state': lambda: security.gen_salt(10)
    },
    base_url='https://ok.cs61a.org/api/v3/',
    request_token_url=None,
    access_token_method='POST',
    access_token_url='https://ok.cs61a.org/oauth/token',
    authorize_url='https://ok.cs61a.org/oauth/authorize',)

login_manager = LoginManager()

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(user_id)

@login_manager.unauthorized_handler
def unauthorized():
    session['after_login'] = request.url
    return redirect(url_for('auth.login'))

def authorize_user(user):
    login_user(user)
    after_login = session.pop('after_login', None) or url_for('index')
    # TODO validate after_login URL
    return redirect(after_login)

def user_from_email(name, email, is_staff):
    """Get a User with the given email, or create one."""
    user = User.query.filter_by(email=email).one_or_none()
    if not user:
        user = User(name=name, email=email, is_staff=is_staff)
    else:
        user.is_staff = is_staff
    db.session.add(user)
    db.session.commit()
    return user

@auth.route('/login/')
def login():
    callback = url_for(".authorized", _external=True)
    print("callback", callback)
    return ok_auth.authorize(callback=callback)

@auth.route('/login/authorized')
def authorized():
    auth_resp = ok_auth.authorized_response()
    if auth_resp is None:
        return 'Access denied: error=%s' % (request.args['error'])
    token = auth_resp['access_token']
    resp = requests.get('https://ok.cs61a.org/api/v3/user/?access_token={}'.format(token))
    resp.raise_for_status()
    user_info = resp.json()['data']
    name = user_info['name']
    email = user_info['email']
    if not name:
        name = email
    is_staff = False
    particips = [p for p in user_info['participations'] if p['course']['offering'] == COURSE_OFFERING]
    if particips and particips[0]['role'] != 'student':
        is_staff = True
    user = user_from_email(name, email, is_staff)
    return authorize_user(user)

@auth.route('/logout/')
def logout():
    session.clear()
    return "Logged out."

def init_app(app):
    app.register_blueprint(auth)
    login_manager.init_app(app)
