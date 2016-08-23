* OK authentication
* Check for staff members using OK API (and render different page)
* Rating
* Assign, don't resolve
* Add resolved_time to Ticket (for analytics)
* Number of people on queue and average wait time (refresh for updates)
* OH locations for dropdown (from config) and separate description field
* Filtering by location
* Logging events to DB
* Deployment to Dokku

Future:
* Option to show assigned tickets
* Websocket implementation
  * Initial dump of data when connecting to server
  * Server sends updates when event happens
  * Client recalculates as needed
* Online integration
* Write tests
* Use WTForms
* Get assignments from OK
* Chat
* Be assigned multiple people at once
* Update your request
* Filter by assignment
* Shut down OH (per location)
* Notify Slack when OH wait time is too long (via web hook, some API for bots too?)
