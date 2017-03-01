let PresenceIndicator = ({presence}) => {
  let numStudentsOnline = presence && presence.student ? presence.student : 0
  let numStaffOnline = presence && presence.staff ? presence.staff : 0
  let color = numStaffOnline ? 'success' : 'warning'

  var studentMessage = numStudentsOnline + " students"
  var staffMessage =  numStaffOnline + " helpers"


  if (numStudentsOnline === 1) {
    studentMessage = studentMessage.slice(0, -1)
  }
  if (numStaffOnline === 1) {
    staffMessage = staffMessage.slice(0, -1)
  }

  let message = studentMessage + " and " + staffMessage + " currently online"

  return (
    <div className="col-xs-12">
      <div className={`alert alert-${color} alert-dismissable fade in`} role="alert">
        {message}
        <button type="button" className="close" aria-label="Close" data-dismiss="alert">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
    </div>
  );
}
