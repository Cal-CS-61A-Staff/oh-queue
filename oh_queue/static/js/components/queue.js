let Queue = ({state}) => {
  let myTicket = getMyTicket(state);
  let tickets = getActiveTickets(state);
  let items = tickets.map((ticket) =>
    <Ticket key={ticket.id} state={state} ticket={ticket}/>
  );
  return (
    <div>
      {!isStaff(state) && <Jumbotron state={state} myTicket={myTicket}/>}
      <div className="container">
        <Messages messages={state.messages}/>
        {isStaff(state) && <FilterControls filter={state.filter}/>}
        {isStaff(state) && <hr />}
        <div className="row">
          <div className="queue center-block">
            {tickets.length == 0 &&
              <div className="row">
                <div className="col-xs-12 text-center">
                  <p className="lead">There are no help requests on the queue.</p>
                </div>
              </div>
            }
            {tickets.length > 0 && items}
          </div>
        </div>
      </div>
    </div>
  );
}
