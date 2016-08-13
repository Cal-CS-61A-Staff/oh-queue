Office Hours
============

## Overview

Provides a web-based interface for requesting help during office hours. Allows students to find others with similar problems, or simply get help from a TA or lab assistant.


## Installation

1. Create an activate a virtualenv:

    $ virtualenv -p python3 env
    $ source env/bin/activate

2. Use pip to install all the dependencies from `requirements.txt`:

    $ pip install -r requirements.txt

3. Execute the following command from `shell.py`: `db.create_all()`. This should
create a database called `app.db` in the repository directory.

    $ python3 shell.py
    >>> db.create_all()
    >>>

4. Run the server:

    $ python3 run.py

5. Point your browser to http://localhost:5000.

## Workflow

There is more documentation within `oh_queue/README.md`.
