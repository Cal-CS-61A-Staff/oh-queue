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
        {isStaff(state) && <FilterControls filter={state.filter}/>}
        {isStaff(state) && <hr class="real"/>}
        <div className="queue">
          {tickets.length == 0 &&
            <div className="row">
              <div className="col-xs-12 text-center">
                <p className="lead">There are no help requests on the queue.</p>
              </div>
            </div>
          }
          <div className="row">
            {tickets.length > 0 && items}
          </div>
        </div>
      </div>
    </div>
  );
}
