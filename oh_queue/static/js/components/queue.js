let Queue = ({state}) => {
  let staff = isStaff(state);
  let myTicket = getMyTicket(state);
  let showJumbotron = !staff && !myTicket;
  let pendingTickets = getTickets(state, 'pending').concat(...getTickets(state, "rerequested"));
  let assignedTickets = getTickets(state, 'assigned');
  let juggledTickets = getTickets(state, 'juggled');
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
        {!showJumbotron && <Messages messages={state.messages}/>}
        <PresenceIndicator state={state} />
        {staff && <FilterControls state={state} filter={state.filter} />}
        {staff && <hr />}
        <Tabs selectedIndex={state.queueTabIndex} onSelect={selectTab}>
          <Tab label={`Waiting (${pendingTickets.length})`}>
            <TicketList tickets={pendingTickets} tstatus={'pending'} state={state} />
          </Tab>
          <Tab label={`On Hold (${juggledTickets.length})`} shouldHighlight={shouldHighlightAssigned}>
            <TicketList tickets={juggledTickets} status={'juggled'} state={state} />
          </Tab>
          <Tab label={`Assigned (${assignedTickets.length})`} shouldHighlight={shouldHighlightAssigned}>
            <TicketList tickets={assignedTickets} status={'assigned'} state={state} />
          </Tab>
        </Tabs>
      </div>
    </div>
  );
}

let TicketList = ({tickets, state, status}) => {
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
