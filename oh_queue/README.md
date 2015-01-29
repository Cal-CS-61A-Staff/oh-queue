# Office Hours Queue
* Real-time queue that replaces writing names on the whiteboard
* Allows TAs to add notes for each request and generate anonymized reports at the end of each OH

## Workflow for TAs
* First, set the session password using `oh.cs61a.org/session_password`.
  - All new requests must provide the session password so that students cannot register before coming
* Then, the TA can help resolve requests. See Workflow for Lab Assistants
* At the end of the office hour, the TA should generate a report using `oh.cs61a.org/generate_report`
  - This will delete all resolved requests from the database.
  - There will be a JSON object returned. I encourage you to send it to me (Dickson) so we can do some
    data analysis regarding office hours/questions for each assignment

## Workflow for Lab Assistants
* Your main page will be `oh.cs61a.org/assist`. You will be provided with a username and password from the TA.
* When you are available, you should click the "Resolve" button for the first person on the list.
* Once you are done helping that student, you should write some notes about helping that student
  - Ideally, your notes will be detailed, e.g. `Fails Q16 test (if (= 3 2) 1 (or x 1)) because called scheme_eval
  too many times in do_or_form`. That way, we can identify common mistakes.

## Workflow for Students
* Students can just go to `oh.cs61a.org`, where they can request for help by pressing the button at the bottom of the page
* Students must provide an SID and a session password, which they can obtain from the OH venue.
  - Concurrent enrollment students can just choose a random number, provided it doesn't clash with another student's number
* While waiting, students should see who else in the queue are stuck on a similar problem and collaborate (without sharing code of course! ;))

## To install
* Make sure to provide your own users.py, where you must define at least the ASSISTANT (level 1) and ADMIN (level 2) users:
    ASSISTANT = {
      "username": "something",
      "password": "something else",
      "level": 1
    }
* To delete existing database, run `db.drop_all()` after running `python shell.py`
* To configure a new database, run `db.create_all()` after running `python shell.py`