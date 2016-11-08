let Queue = ({state}) => {
  let myTicket = getMyTicket(state);
  let showJumbotron = !isStaff(state) && !myTicket;
  let pendingTickets = getTickets(state, 'pending');
  let assignedTickets = getTickets(state, 'assigned');
  let selectTab = (index) => {
    state.queueTabIndex = index;
    app.refresh();
  }
  return (
    <div>
      {showJumbotron && <Jumbotron state={state}/>}
      <div className="container">
        <Messages messages={state.messages}/>
        {isStaff(state) && <FilterControls filter={state.filter}/>}
        {isStaff(state) && <hr />}
        <div className="row">
          <Tabs selectedIndex={state.queueTabIndex} onSelect={selectTab}>
            <Tab label={`Waiting (${pendingTickets.length})`}>
              <TicketList
                tickets={pendingTickets}
                state={state} />
            </Tab>
            <Tab label={`Assigned (${assignedTickets.length})`}>
              <TicketList
                tickets={assignedTickets}
                state={state} />
            </Tab>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

let TicketList = ({state, tickets}) => {
  let items = applyFilter(state.filter, tickets).map((ticket) =>
    <Ticket key={ticket.id} state={state} ticket={ticket}/>
  );
  return (
    <div className="queue">
      {items.length == 0 &&
        <div className="row">
          <div className="col-xs-12 text-center">
            <p className="lead">There are no help requests on the queue.</p>
          </div>
        </div>
      }
      {items}
    </div>
  );
};
