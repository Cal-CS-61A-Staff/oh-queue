from flask import Blueprint, abort, redirect, render_template, request, session, url_for
from flask_login import LoginManager, login_user
from flask_oauthlib.client import OAuth, OAuthException

from oh_queue.models import db, User

auth = Blueprint('auth', __name__)

oauth = OAuth()
google_auth = oauth.remote_app(
    'google',
    app_key='GOOGLE',
    request_token_params={
        'scope': 'email',
        'prompt': 'select_account'
    },
    base_url='https://www.googleapis.com/oauth2/v1/',
    request_token_url=None,
    access_token_method='POST',
    access_token_url='https://accounts.google.com/o/oauth2/token',
    authorize_url='https://accounts.google.com/o/oauth2/auth',
)

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

def user_from_email(name, email):
    """Get a User with the given email, or create one."""
    user = User.query.filter_by(email=email).one_or_none()
    if not user:
        user = User(name=name, email=email)
        db.session.add(user)
        db.session.commit()
    return user

@auth.route('/login/')
def login():
    callback = url_for(".authorized")
    return render_template('login.html', callback=callback)

@auth.route('/login/authorized/', methods=['POST'])
def authorized():
    user = user_from_email(request.form['name'], request.form['email'])
    return authorize_user(user)

@auth.route('/logout/')
def logout():
    abort(403)

def init_app(app):
    app.register_blueprint(auth)
    login_manager.init_app(app)
