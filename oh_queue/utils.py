from flask import current_app, session
import requests

def ok_api(route):
    """Make a GET request to the OK API. Automatically authenticates."""
    server_url = current_app.config['OK_SERVER_URL']
    resp = requests.get(server_url + '/api/v3/' + route, params={
        'access_token': session.get('access_token', '')
    })
    resp.raise_for_status()
    return resp.json()['data']
