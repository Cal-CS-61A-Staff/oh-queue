let PresenceIndicator = ({presence, state}) => {
  let numStudentsOnline = presence && presence.students ? presence.students : 0
  let numStaffOnline = presence && presence.staff ? presence.staff : 0
  let color = numStaffOnline ? 'success' : 'warning'
  let pendingTickets = getTickets(state, 'pending');
  let assignedTickets = getTickets(state, 'assigned');

  var studentMessage = numStudentsOnline + " students"
  var staffMessage =  numStaffOnline + " assistants"


  if (numStudentsOnline === 1) {
    studentMessage = studentMessage.slice(0, -1)
  }
  if (numStaffOnline === 1) {
    staffMessage = staffMessage.slice(0, -1)
  }

  let message = studentMessage + " and " + staffMessage + " currently online."
  
  // average time to finish helping a single student
  var avgHelpTime = 10

  // how many assistants are unoccupied
  var availableAssistants = numStaffOnline - assignedTickets.length

  // how many students will have to wait until an assistant is free
  var stillNeedHelp = Math.max(0, pendingTickets.length - availableAssistants)

  // expecting 10 minutes per person who still needs help
  var estWaitTime = Math.floor(avgHelpTime * stillNeedHelp)

  // construct boundaries around this time
  // interval generally becomes smaller (sample mean approaches true mean) as more assistants available
  var estWaitTimeMin = Math.max(0, Math.floor(estWaitTime - getRandomArbitrary(1, (availableAssistants + 10)/(availableAssistants + 1))))
  var estWaitTimeMax = Math.ceil(estWaitTime + getRandomArbitrary(1, (availableAssistants + 10)/(availableAssistants + 1)))

  // colors for the time
  if (estWaitTime <= 5) {
      var col ="#009900"  
  } else if (estWaitTime < 10) {
      var col ="#739900"
  } else if (estWaitTime < 25) {
      var col ="#cc5200"
  } else {
      var col ="#ff0000"
  }

  var timeRange = estWaitTimeMin + " - " + estWaitTimeMax

  // catch if there actually are no assistants available
  if (numStaffOnline == 0) {
    var timeRange = "Unknown"
    var col = "#646468"
  }


  return (
    <div className="col-xs-12">

    <div className={`alert alert-${color} alert-dismissable fade in`} role="alert">
      <button type="button" className="close" aria-label="Close" data-dismiss="alert">
          <span aria-hidden="true">&times;</span>
        </button>
      <div> <font size="6">Estimated wait time: <font color={col}><strong>{timeRange}</strong></font> minutes </font></div>
      <p> <br></br> To help reduce wait time: <br></br></p>
      <p> &#8594; Plan ahead what questions you want to ask (we will limit time spent to <strong> 10 </strong> minutes per person) </p>
      <p> &#8594; When applicable, be prepared to explain your reasoning, attempts, and current approach</p>
      <p> &#8594; Check out other resources, including <a href="http://www.piazza.com">piazza</a>, to make sure your question wasn&apos;t already answered</p>
      </div>

      <div className={`alert alert-${color} alert-dismissable fade in`} role="alert">
      {message}
      <button type="button" className="close" aria-label="Close" data-dismiss="alert">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
    </div>
  );
}

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}
