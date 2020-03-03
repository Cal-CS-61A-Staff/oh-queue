class TicketLayout extends React.Component {
  componentWillMount() {
    let id = +this.props.match.params.id;
    let state = this.props.state;
    let ticket = getTicket(state, id);
    if (ticket == null) {
      this.props.loadTicket(id);
    }
  }

  render() {
    let id = +this.props.match.params.id;
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

    let assignment = ticketAssignment(state, ticket);
    let location = ticketLocation(state, ticket);
    let question = ticketQuestion(state, ticket);

    return (
      <div>
        <Navbar state={state} mode="queue" />
        <div className="container">
          <Messages messages={state.messages}/>
          <div className="row ticket">
            <div className="col-xs-12">
              <h2 className="ticket-view-name text-center">
                { (ticket.status === 'pending' && isStaff(state)) ? 'Help to View Name' : ticket.user.name }
                <small className="clearfix">{ assignment.name } { question } &middot; { location.name } </small>
              </h2>
               <p className="ticket-view-text text-center"> { ticketStatus(state, ticket) } </p>
            </div>
          </div>
          <div className="row">
            <div className="col-xs-12 col-md-6 col-md-offset-3">
              <hr />
              <DescriptionBox state={state} ticket={ticket}/>
            </div>
          </div>
          <div className="row">
            <div className="col-xs-12 col-md-6 col-md-offset-3">
              <hr />
              <UpdateLocationBox state={state} ticket={ticket}/>
            </div>
          </div>
            {state.config.ticket_prompt &&
            <div className="row">
                <div className="col-xs-12 col-md-6 col-md-offset-3">
                    <hr/>
                    <ReactMarkdown source={state.config.ticket_prompt}/>
                </div>
            </div>
            }
          <TicketButtons state={state} ticket={ticket}/>
        </div>
      </div>
    );
  }
}
