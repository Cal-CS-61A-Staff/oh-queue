"""
TODO
mock OAuth
mock OK API
"""
import os
import signal

from flask_testing import LiveServerTestCase, TestCase
import json
import multiprocessing
import requests
from selenium import webdriver
import selenium.common.exceptions
import time

from oh_queue import app, socketio
from oh_queue.models import db

class Client:
    def __init__(self, name, server_url):
        self.name = name
        self.server_url = server_url
        try:
            self.driver = webdriver.PhantomJS()
        except selenium.common.exceptions.WebDriverException:
            raise AssertionError("PhantomJS is not installed")

    def load_page(self, path):
        self.driver.get(self.server_url + path)

        # View all requests made by the page
        for entry in self.driver.get_log('har'):
            data = json.loads(entry['message'])
            requests = data['log']['entries']
            for req in requests:
                if not req['response']['status']:
                    print(req)
                    raise AssertionError('Request by page did not complete')

        # Assert no JS console messages
        console_log = self.driver.get_log('browser')
        if console_log:
            print(console_log)
            raise AssertionError('There are JavaScript errors')

    def submit_form(self, form_data):
        input_element = None
        for name, value in form_data.items():
            input_element = self.driver.find_element_by_name(name)
            if type(value) == str:
                input_element.send_keys(value)
            elif value is True:
                input_element.click()
            elif value is False:
                pass
            else:
                raise AssertionError('Unknown form value "{value}" '
                    'for input named "{name}"'.format(name=name, value=value))
        if not input_element:
            raise AssertionError('No data in form')
        input_element.submit()

class WebTest(LiveServerTestCase, TestCase):
    def setUp(self):
        super(WebTest, self).setUp()
        db.create_all(app=app)
        self.clients = []

    def tearDown(self):
        super(WebTest, self).tearDown()
        db.session.remove()
        db.drop_all(app=app)
        for client in self.clients:
            client.driver.quit()

    def create_app(self):
        app.config['TESTING'] = True
        app.config['LIVESERVER_PORT'] = 8943
        return app

    def _spawn_live_server(self):
        worker = lambda: socketio.run(self.app, port=self.port)

        self._process = multiprocessing.Process(target=worker)
        self._process.start()

        # We must wait for the server to start listening, but give up
        # after a specified maximum timeout
        timeout = self.app.config.get('LIVESERVER_TIMEOUT', 5)
        start_time = time.time()

        while True:
            elapsed_time = (time.time() - start_time)
            if elapsed_time > timeout:
                raise RuntimeError(
                    "Failed to start the server after %d seconds. " % timeout
                )

            if self._can_ping_server():
                break

    def _terminate_live_server(self):
        """ Properly handle termination for coverage reports.
        Works on *nix systems (aka not windows).
        https://github.com/jarus/flask-testing/issues/70 """
        # Handle Windows
        if os.name == "nt":
            print("Coverage may not properly be reported on Windows")
            return LiveServerTestCase._terminate_live_server(self)
        os.kill(self._process.pid, signal.SIGINT)
        self._process.join()

    def new_client(self, name, is_staff=False):
        client = Client(name, self.get_server_url())
        self.clients.append(client)

        # Log in
        client.load_page('/testing-login/')
        client.submit_form({
            'email': name + '@example.com',
            'name': name.title() + ' McGee',
            'is_staff': is_staff,
        })
        return client

    def test_index(self):
        alice = self.new_client('alice')
        alice.load_page('/')
        self.assertEqual(alice.driver.title, 'CS 61A OH Queue')
