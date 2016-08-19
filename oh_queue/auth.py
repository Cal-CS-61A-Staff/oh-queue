from flask import Blueprint, render_template, abort

auth = Blueprint('auth', __name__)

@auth.route('/login/')
def login():
    abort(403)

@auth.route('/logout/')
def logout():
    abort(403)
