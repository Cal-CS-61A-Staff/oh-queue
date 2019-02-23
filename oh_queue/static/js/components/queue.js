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
        {isStaff(state) && <FilterControls filter={state.filter}/>}
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

