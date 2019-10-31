Office Hours Queue
==================

## Overview

Provides a web-based interface for requesting help during office hours.

Students request help on an assignment and question number from a location.

This app uses [Ok](https://okpy.org) to manage access. Even if you aren't using Ok for assignments, you should create a course on Ok and enroll all of your staff, academic interns, and students with the appropriate roles.

## Installation

1. Clone this repo:

    ```
    git clone https://github.com/Cal-CS-61A-Staff/oh-queue.git
    ```
    Then cd into it:
    ```
    cd oh-queue
    ```

2. Create and activate a virtualenv:
    ```
    python3 -m virtualenv env  (If this does not work, try: `virtualenv -p python3 env`)
    source env/bin/activate
    ```

3. Use pip to install all the dependencies:
    ```
    pip install -r requirements.txt
    npm install
    ```

4. Run the database migrations to setup the initial database.
    ```
    ./manage.py db upgrade
    ```
    If you get the error "TypeError: OAuthRemoteApp requires consumer key and secret", you need to set your OK_KEY and OK_SECRET environment variables.

5. Run the server:
    ```
    ./manage.py server
    ```

6. Point your browser to http://localhost:5000.  (This might take a while the first time.)

7. You can log in as any email while testing by going to http://localhost:5000/testing-login/.

### Dokku: Initial Deployment

    dokku apps:create app-name
    dokku clone app-name https://github.com/Cal-CS-61A-Staff/oh-queue
    dokku mysql:create db-name
    dokku mysql:link db-name app-name
    dokku domains:set app-name <domain>

    dokku config:set app-name OH_QUEUE_ENV=prod OK_KEY=<OK CLIENT> OK_SECRET=<OK SECRET> SECRET_KEY=<DB SECRET> COURSE_NAME="CS 61A" COURSE_OFFERING="cal/cs61a/fa16"
    dokku run app-name ./manage.py db upgrade
    dokku letsencrypt app-name
    # Change OK OAuth to support the domain

For `OK_KEY` and `OK_SECRET`, you'll need to create an Ok OAuth client [here](https://okpy.org/admin/clients) and have it approved by an Ok admin.

### Dokku: Upgrading

    dokku clone app-name https://github.com/Cal-CS-61A-Staff/oh-queue
    dokku run app-name ./manage.py db upgrade

### Configuration

The following env variables can be set to customize the app:

- `COURSE_NAME` - Name of course as displayed in the app
- `LOCATIONS` - Comma-separated list of locations students can request help from
- `ASSIGNMENTS` - Comma-separate list of assignments students can request help on
