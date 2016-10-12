let Ticket = ({state, ticket, myTicket, index}) => {
  var ticketRow;
  if (isStaff(state)) {
    ticketRow = <div>  
                  <div className="hidden-xs col-sm-1 truncate">{ index + 1 }</div>
                  <div className="hidden-xs col-sm-2 truncate">{ ticketDisplayTime(ticket) }</div>
                  <div className="col-xs-3 col-sm-2 truncate">{ticket.location}</div>
                  <div className="col-xs-3 col-sm-2 truncate">{ticket.assignment}</div>
                  <div className="col-xs-2 col-sm-2 truncate">{ticket.question}</div>
                  <div className="hidden-xs col-sm-1 truncate">{ticket.elapsed}</div>
                  <div className="col-xs-4 col-sm-2 truncate">{ticketStatus(state, ticket)}</div>
                </div>
  } else {
    ticketRow = <div>
                  <div className="hidden-xs col-sm-1 truncate">{ index + 1 }</div>
                  <div className="hidden-xs col-sm-2 truncate">{ ticketDisplayTime(ticket) }</div>
                  <div className="col-xs-3 col-sm-2 truncate">{ticket.location}</div>
                  <div className="col-xs-3 col-sm-2 truncate">{ticket.assignment}</div>
                  <div className="col-xs-2 col-sm-2 truncate">{ticket.question}</div>
                  <div className="col-xs-4 col-sm-3 truncate">{ticketStatus(state, ticket)}</div>
                </div>
  }

  return (
    <TicketLink state={state} ticket={ticket} myTicket={myTicket}>
      {ticketRow}
    </TicketLink>
  );
}

let TicketLink = ({state, ticket, myTicket, children}) => {
  if (isTicketHelper(state, ticket) || (myTicket && myTicket.id === ticket.id)) {
    return (
      <div className="row highlight">
        <ReactRouter.Link to={`/${ticket.id}/`} className="ticket-link">
          {children}
        </ReactRouter.Link>
      </div>
    );
  } else if (isStaff(state)) {  // staff
    return (
      <div className="row">
        <ReactRouter.Link to={`/${ticket.id}/`} className="ticket-link">
          {children}
        </ReactRouter.Link>
      </div>
    );
    destination = `/${ticket.id}/`;
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
