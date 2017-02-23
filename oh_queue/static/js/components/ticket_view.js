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
          <div className="col-xs-12 col-sm-7 col-md-5">
            <h2 className="text-center">
              { (ticket.status === 'pending' && isStaff(state)) ? 'Help to View Name' : ticket.user.name }
              <small className="clearfix">{ ticketDisplayTime(ticket) } in { ticket.location }</small>
            </h2>
            <p className="lead text-center">{ ticketStatus(state, ticket) }</p>
            <h3 className="text-center">
              <span className="label label-default">{ ticket.assignment } Q{ ticket.question }</span>
            </h3>
            <br />
            <TicketButtons state={state} ticket={ticket}/>
          </div>
          <DescriptionBox state={state} ticket={ticket}/>

        </div>
      </div>
    );
  }
}
