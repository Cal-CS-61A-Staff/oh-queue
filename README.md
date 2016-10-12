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

3. Reset the database to create tables.

    ./manage.py resetdb

4. Run the server:

    ./manage.py server

5. Point your browser to http://localhost:5000.

## Deployment

First point a git remote to the Dokku server:

    git remote add dokku dokku@app.cs61a.org:officehours-web

To deploy:

    git push dokku master
