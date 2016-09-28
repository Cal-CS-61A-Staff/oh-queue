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
        return <div/>;  // TODO spinner instead of blank screen
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
            <h2 className="text-center">
              { ticket.user.name }
              <small className="clearfix">{ ticket.created } in { ticket.location }</small>
            </h2>
            <p className="lead text-center">{ ticketStatus(state, ticket) }</p>
            <h3 className="text-center">
              <span className="label label-default">{ ticket.assignment } Q{ ticket.question }</span>
            </h3>
          </div>
        </div>
        <TicketButtons state={state} ticket={ticket}/>
      </div>
    );
  }
}
