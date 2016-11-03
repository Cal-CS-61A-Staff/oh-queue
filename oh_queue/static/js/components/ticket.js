let Ticket = ({state, ticket, myTicket, index}) => {
  return (
    <TicketLink state={state} ticket={ticket} myTicket={myTicket}>
      <div className="panel-body">
        <h2>{ticket.assignment} Q{ticket.question}<br /><small>{ticket.location}</small></h2>
      </div>
      <div className="panel-footer">
        <small>#{index + 1} {ticketStatus(state, ticket)} at {ticketDisplayTime(ticket)}</small>
      </div>
    </TicketLink>
  );
}

let TicketLink = ({state, ticket, myTicket, children}) => {
  if (isTicketHelper(state, ticket) || (myTicket && myTicket.id === ticket.id)) {
    return (
      <div className="col-xs-12 col-md-4">
        <div className="panel panel-primary">
          <ReactRouter.Link to={`/${ticket.id}/`} className="ticket-link">
            {children}
          </ReactRouter.Link>
        </div>
      </div>
    );
  } else if (isStaff(state)) {  // staff
    return (
      <div className="col-xs-12 col-md-4">
        <div className="panel panel-default">
          <ReactRouter.Link to={`/${ticket.id}/`} className="ticket-link">
            {children}
          </ReactRouter.Link>
        </div>
      </div>
    );
    destination = `/${ticket.id}/`;
  } else if (state.currentUser) {  // student and logged in
    return (
      <div className="col-xs-12 col-md-4">
        <div className="panel panel-default">
          <a href="#" className="disabled-link">
            {children}
          </a>
        </div>
      </div>
    );
  } else {  // logged out
    return (
      <div className="col-xs-12 col-md-4">
        <div className="panel panel-default">
          <a href="/login" className="ticket-link">
            {children}
          </a>
        </div>
      </div>
    );
  }
}
