let Ticket = ({state, ticket}) => {
  return (
    <TicketLink state={state} ticket={ticket}>
      <div className="col-xs-3 col-sm-2 truncate">{ticket.user.name}</div>
      <div className="hidden-xs col-sm-2 truncate">{ticket.created}</div>
      <div className="col-xs-3 col-sm-2 truncate">{ticket.location}</div>
      <div className="col-xs-3 col-sm-2 truncate">{ticket.assignment}</div>
      <div className="hidden-xs col-sm-2 truncate">{ticket.question}</div>
      <div className="col-xs-3 col-sm-2 truncate">{ticketStatus(state, ticket)}</div>
    </TicketLink>
  );
}

let TicketLink = ({state, ticket, children}) => {
  // my ticket
  if (state.currentUser && state.currentUser.id === ticket.user.id) {
    return (
      <div className="row highlight">
        <ReactRouter.Link to={`/${ticket.id}`} className="ticket-link">
          {children}
        </ReactRouter.Link>
      </div>
    );
  } else if (isStaff(state)) {  // staff
    return (
      <div className="row">
        <ReactRouter.Link to={`/${ticket.id}`} className="ticket-link">
          {children}
        </ReactRouter.Link>
      </div>
    );
    destination = `/${ticket.id}`;
  } else if (state.currentUser) {  // student and logged in
    return (
      <div className="row">
        <a href="#" className="disabled-link">
          {children}
        </a>
      </div>
    );
  } else {  // logged out
    return (
      <div className="row">
        <a href="/login" className="ticket-link">
          {children}
        </a>
      </div>
    );
  }
}
