let Queue = ({state}) => {
  let myTicket = getMyTicket(state);
  let tickets = getActiveTickets(state);
  let items = tickets.map((ticket, index) =>
    <Ticket key={ticket.id} state={state} ticket={ticket} myTicket={myTicket} index={index} />
  );
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
          <div className="row">
            <div className="hidden-xs col-sm-1">#</div>
            <div className="hidden-xs col-sm-2 ">Queue Time</div>
            <div className="col-xs-3 col-sm-2">Location</div>
            <div className="col-xs-3 col-sm-2">Assignment</div>
            <div className="col-xs-2 col-sm-2">Question</div>
            <div className="col-xs-4 col-sm-3">Status</div>
          </div>
          {tickets.length == 0 &&
            <div className="row">
              <div className="col-xs-12 col-xs-offset-4">
                <strong><small>There are no active tickets in the queue.</small></strong>
              </div>
            </div>
          }
          {tickets.length > 0 && items}
        </div>
      </div>
    </div>
  );
}
