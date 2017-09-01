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
  
  var avgHelpTime = 7 + getRandomArbitrary(0, 1/(numStaffOnline + 1))

  var availableAssistants = numStaffOnline - assignedTickets.length
  var stillNeedHelp = Math.max(0, pendingTickets.length - availableAssistants)
  var estWaitTime = Math.floor(avgHelpTime * stillNeedHelp)

  if (estWaitTime <= 10) {
      var col ="#00ff00"
  } else if (estWaitTime < 20) {
      var col ="#ffff00"
  } else if (estWaitTime < 30) {
      var col ="#ff6600"
  } else {
      var col ="#ff0000"
  }

  if (numStaffOnline == 0) {
    var estWaitTime = "N/A"
    var col ="#ff0000"
  }


  return (
    <div className="col-xs-12">
      <div className={`alert alert-${color} alert-dismissable fade in`} role="alert">
      {message}
      <button type="button" className="close" aria-label="Close" data-dismiss="alert">
          <span aria-hidden="true">&times;</span>
        </button>
      <div> Estimated wait time: <font color={col}><strong>{estWaitTime}</strong></font> minutes </div>
      </div>
    </div>
  );
}

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}
