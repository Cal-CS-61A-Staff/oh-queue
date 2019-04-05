let Queue = ({state}) => {
  let staff = isStaff(state);
  let myTicket = getMyTicket(state);
  let showJumbotron = !staff && !myTicket;
  let pendingTickets = getTickets(state, 'pending');
  let assignedTickets = getTickets(state, 'assigned');
  let shouldHighlightAssigned = staff && getHelpingTicket(state);
  let selectTab = (index) => {
    state.queueTabIndex = index;
    app.refresh();
  }
  let containerClass = classNames({
    'container': true,
    'stub-jumbotron': !showJumbotron,
  });
  return (
    <div>
      {showJumbotron && <Jumbotron state={state}/>}
      <div className={containerClass}>
        <Messages messages={state.messages}/>
        <PresenceIndicator state={state} />
        {isStaff(state) && <FilterControls state={state} filter={state.filter}/>}
        {isStaff(state) && <hr />}
        <Tabs selectedIndex={state.queueTabIndex} onSelect={selectTab}>
          <Tab label={`Waiting (${pendingTickets.length})`}>
            <TicketList status={'pending'} state={state} />
          </Tab>
          <Tab label={`Assigned (${assignedTickets.length})`} shouldHighlight={shouldHighlightAssigned}>
            <TicketList status={'assigned'} state={state} />
          </Tab>
        </Tabs>
      </div>
    </div>
  );
}

let TicketList = ({state, status}) => {
  let tickets = getTickets(state, status);
  let filteredTickets = applyFilter(state.filter, tickets);
  let items = filteredTickets.map((ticket) =>
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
    body = [<GroupActions key="group" tickets={filteredTickets} status={status} state={state} />].concat(items)
  }

  return (
    <div className="queue">
      {body}
    </div>
  );
};
