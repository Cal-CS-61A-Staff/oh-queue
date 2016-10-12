let Queue = ({state}) => {
  let myTicket = getMyTicket(state);
  let items = getActiveTickets(state).map((ticket, index) =>
    <Ticket key={ticket.id} state={state} ticket={ticket} myTicket={myTicket} index={index} />
  );
  
  var tableHeader;
  if (isStaff(state)) {
    tableHeader =  <div className="row">
                        <div className="hidden-xs col-sm-1">#</div>
                        <div className="hidden-xs col-sm-2 ">Queue Time</div>
                        <div className="col-xs-3 col-sm-2">Location</div>
                        <div className="col-xs-3 col-sm-2">Assignment</div>
                        <div className="col-xs-2 col-sm-2">Question</div>
                        <div className="hidden-xs col-sm-1">Time Spent</div>
                        <div className="col-xs-4 col-sm-2">Status</div>
                      </div>    

  } else {
    tableHeader = <div className="row">
                        <div className="hidden-xs col-sm-1">#</div>
                        <div className="hidden-xs col-sm-2 ">Queue Time</div>
                        <div className="col-xs-3 col-sm-2">Location</div>
                        <div className="col-xs-3 col-sm-2">Assignment</div>
                        <div className="col-xs-2 col-sm-2">Question</div>
                        <div className="col-xs-4 col-sm-3">Status</div>
                      </div>
  }

  return (
    <div>
      {!isStaff(state) && <Jumbotron state={state} myTicket={myTicket}/>}
      <div className="container">
        <Messages messages={state.messages}/>
        <div className="queue">
          {isStaff(state) &&
            <div className="row">
              <div className="col-xs-12 alert alert-info">
                Click on a ticket to view the student's name
              </div>
            </div>
          }
          {tableHeader}
          {items}
        </div>
      </div>
    </div>
  );
}
