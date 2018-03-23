let PresenceIndicator = ({state}) => {
  let presence = state.presence
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

  // PARAM 1: expected service time ~ Exponential(1/10)
  var avgHelpTime = 10

  // how many assistants are unoccupied
  var availableAssistants = numStaffOnline - assignedTickets.length

  // how many students need help, assuming all avaiable assistants are assigned
  var stillNeedHelp = Math.max(0, pendingTickets.length - availableAssistants)

  // catch if there actually are no assistants available
  if (numStaffOnline == 0) {
    var timeRange = "??"
    var col = "#646468"
  } else {
    // min of numStaffOnline exponentials is exponential, take expectation
    var expectedWaitFirst = Math.ceil(avgHelpTime/numStaffOnline)
    // standard deviation of exponential equals the expectation
    var stdDev = expectedWaitFirst

    // expectation for stillNeedHelp + 1th student on queue
    var expectedWaitTotal = (stillNeedHelp + 1) * expectedWaitFirst

    // PARAM 2: (75% conf interval by CLT, 1.15 is from zscore of Normal)
    var bound = 1.15 * stdDev/Math.sqrt(numStaffOnline)

    // interval bounds
    var estWaitTimeMin = Math.max(0, Math.floor(expectedWaitTotal - bound))
    var estWaitTimeMax = Math.ceil(expectedWaitTotal + bound)

    // colors for the time
    if (expectedWaitTotal <= 5) {
      var col ="#009900"
    } else if (expectedWaitTotal < 10) {
      var col ="#739900"
    } else if (expectedWaitTotal < 25) {
      var col ="#cc5200"
    } else {
      var col ="#ff0000"
    }

    // concatenate time range string
    var timeRange = estWaitTimeMin + " - " + estWaitTimeMax
  }

  return (
    <div className="col-xs-12">

      <div className={`alert alert-${color} alert-dismissable fade in`} role="alert">
        <button type="button" className="close" aria-label="Close" data-dismiss="alert">
            <span aria-hidden="true">&times;</span>
        </button>
        <h1><font size="6">Estimated wait time: <font color={col}><strong>{timeRange}</strong></font> minutes </font></h1>
        <p>To help reduce wait time:</p>
        <ul className='wait-suggestions'>
          <li>Plan ahead what questions you want to ask (we will limit time spent to <strong> 10 </strong> minutes per person)</li>
          <li>When applicable, be prepared to explain your reasoning, attempts, and current approach</li>
          <li>Check out other resources, including <a href="http://www.piazza.com">piazza</a>, to make sure your question wasn&apos;t already answered</li>
          <li>We will <strong>not</strong> be helping out with extra credit unless there is no-one else on the queue</li>
        </ul>
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
