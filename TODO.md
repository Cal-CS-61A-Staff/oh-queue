* OK authentication
* Check for staff members using OK API (and render different page)
* Create form on separate page
* Use WTForms
* Rating
* Assign, don't resolve
* ./manage.py scripts for creating and dropping. Right now:
```
$ ./shell.py
>>> db.drop_all(app=app)
>>> db.create_all(app=app)
```
* Add resolved_time to Ticket (for analytics)
