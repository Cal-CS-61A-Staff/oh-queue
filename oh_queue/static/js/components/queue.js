let Queue = ({state, location}) => {
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
      {showJumbotron && <Jumbotron state={state} onlineUrl={location.query.oh_url}/>}
      <div className={"container" + (showJumbotron ? "": ' stub-jumbotron')}>
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
  var body;
  if (tickets.length === 0) {
    body = (
      <div className="no-results">
        <h4>No help requests</h4>
      </div>
    );
  } else if (items.length === 0) {
    body = (
      <div className="no-results">
        <h4>No help requests matched your search</h4>
      </div>
    );
  } else {
    body = items;
  }

  return (
    <div className="queue">
      {body}
    </div>
  );
};
