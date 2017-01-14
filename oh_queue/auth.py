from flask import Blueprint, abort, redirect, render_template, request, session, url_for
from flask_login import LoginManager, login_user, logout_user, current_user
from flask_oauthlib.client import OAuth, OAuthException

from werkzeug import security

from oh_queue.models import db, User

auth = Blueprint('auth', __name__)
auth.config = {}

oauth = OAuth()

@auth.record
def record_params(setup_state):
    app = setup_state.app
    server_url = app.config.get('OK_SERVER_URL')
    auth.ok_auth = oauth.remote_app(
        'ok-server',
        consumer_key=app.config.get('OK_KEY'),
        consumer_secret=app.config.get('OK_SECRET'),
        request_token_params={
            'scope': 'email',
            'state': lambda: security.gen_salt(10)
        },
        base_url=server_url + '/api/v3/',
        request_token_url=None,
        access_token_method='POST',
        access_token_url=server_url + '/oauth/token',
        authorize_url=server_url + '/oauth/authorize',)
    auth.course_offering = app.config.get('COURSE_OFFERING')
    auth.debug = app.config.get('DEBUG')

    @auth.ok_auth.tokengetter
    def get_access_token(token=None):
        return session.get('access_token')

login_manager = LoginManager()

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(user_id)

@login_manager.unauthorized_handler
def unauthorized():
    session['after_login'] = request.url
    return redirect(url_for('auth.login'))

def authorize_user(user):
    login_user(user, remember=True)
    after_login = session.pop('after_login', None) or url_for('index')
    # TODO validate after_login URL
    return redirect(after_login)

def user_from_email(name, email, is_staff):
    """Get a User with the given email, or create one."""
    user = User.query.filter_by(email=email).one_or_none()
    if not user:
        user = User(name=name, email=email, is_staff=is_staff)
    else:
        user.name = name
        user.is_staff = is_staff
    db.session.add(user)
    db.session.commit()
    return user

@auth.route('/login/')
def login():
    callback = url_for(".authorized", _external=True)
    return auth.ok_auth.authorize(callback=callback)


@auth.route('/assist/')
def try_login():
    if current_user.is_authenticated:
        return redirect(url_for('index'))
    callback = url_for(".authorized", _external=True)
    return auth.ok_auth.authorize(callback=callback)

@auth.route('/login/authorized')
def authorized():
    auth_resp = auth.ok_auth.authorized_response()
    if auth_resp is None:
        return 'Access denied: error=%s' % (request.args['error'])
    token = auth_resp['access_token']
    session['access_token'] = (token, '')  # (access_token, secret)
    info = auth.ok_auth.get('user').data['data']
    email = info['email']
    name = info['name']
    if not name:
        name = email
    if ', ' in name:
        last, first = name.split(', ')
        name = first + ' ' + last
    is_staff = False
    offering = auth.course_offering
    for p in info['participations']:
        if p['course']['offering'] == offering and p['role'] != 'student':
            is_staff = True
    user = user_from_email(name, email, is_staff)
    return authorize_user(user)

@auth.route('/logout/')
def logout():
    logout_user()
    session.pop('access_token', None)
    return redirect(url_for('index'))

@auth.route('/testing-login/')
def testing_login():
    if not auth.debug:
        abort(404)
    callback = url_for(".testing_authorized")
    return render_template('login.html', callback=callback)

@auth.route('/testing-login/authorized', methods=['POST'])
def testing_authorized():
    if not auth.debug:
        abort(404)
    form = request.form
    is_staff = form.get('is_staff') == 'on'
    user = user_from_email(form['name'], form['email'], is_staff)
    return authorize_user(user)

def init_app(app):
    app.register_blueprint(auth)
    login_manager.init_app(app)
