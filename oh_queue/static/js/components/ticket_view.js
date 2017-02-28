class TicketView extends React.Component {
  componentWillMount() {
    let id = +this.props.params.id;
    let state = this.props.state;
    let ticket = getTicket(state, id);
    if (ticket == null) {
      app.loadTicket(id);
    }
  }

  render() {
    let id = +this.props.params.id;
    let state = this.props.state;
    let ticket = getTicket(state, id);

    if (ticket == null) {
      if (isLoading(state, id)) {
        return null;  // TODO loading indicator instead of blank screen
      } else {
        return <NotFound/>;
      }
    }

    if (!isStaff(state) && !ticketIsMine(state, ticket)) {
      return <NotFound/>;
    }

    return (
      <div className="container">
        <Messages messages={state.messages}/>
        <div className="row ticket">
          <div className="col-xs-12">
            <h3 className="ticket-view-name text-center">
              { (ticket.status === 'pending' && isStaff(state)) ? 'Help to View Name' : ticket.user.name }
            </h3>
            <p className="ticket-view-text text-center">{ ticket.assignment } Q{ ticket.question } &middot; { ticketDisplayTime(ticket) } in { ticket.location }</p>
            <p className="ticket-view-text text-center">{ ticketStatus(state, ticket) }</p>
          </div>
        </div>
        <DescriptionBox state={state} ticket={ticket}/>
        <TicketButtons state={state} ticket={ticket}/>
      </div>
    );
  }
}
