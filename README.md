Office Hours
============

## Overview

Provides a web-based interface for requesting help during office hours. Allows students to find others with similar problems, or simply get help from a TA or lab assistant.


## Installation

1. Create an activate a virtualenv:

    virtualenv -p python3 env

    source env/bin/activate

2. Use pip to install all the dependencies:

    pip install -r requirements.txt

    npm install

3. Reset the database to create tables:

    ./manage.py resetdb

4. Run the server:

    ./manage.py server

5. Point your browser to http://localhost:5000.

## Deployment

First point a git remote to the Dokku server:

    git remote add dokku dokku@app.cs61a.org:officehours-web

To deploy from master:

    git push dokku master

Deploy from another branch:

	git push dokku my_branch:master

### First Time Deployment

	dokku apps:create app-name
	git remote add online dokku@app.cs61a.org:app-name
	dokku mysql:create db-name
	dokku mysql:link db-name app-name
	# Set DNS record
	dokku domains:add app-name name.cs61a.org

	dokku config:set app-name SECRET_KEY=<SECRET> OH_QUEUE_ENV=prod COURSE_NAME="CS 61A" COURSE_OFFERING="cal/cs61a/fa16"
	dokku run app-name /bin/bash
		$ python
		>>> from oh_queue import app
		>>> from oh_queue.models import db
		>>> db.create_all(app=app)
		>>> exit()
		$ exit
	dokku letsencrypt app-name
	# Change OK OAuth to support the domain
