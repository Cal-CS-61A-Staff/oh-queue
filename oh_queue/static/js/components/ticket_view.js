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
            <h2 className="ticket-view-name text-center">
              { (ticket.status === 'pending' && isStaff(state)) ? 'Help to View Name' : ticket.user.name }
              <small className="clearfix">{ ticket.assignment } Q{ ticket.question } &middot; { ticket.location } </small>
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
        <div className="row">
          <div className="col-xs-12 col-md-6 col-md-offset-3">
            <hr />
            <h4>If you would like to anonymously submit feedback about someone who helped you today, click <a href="https://forms.gle/rPzXDXo2azj2kU8U7">here</a>.</h4>
          </div>
        </div>
        <TicketButtons state={state} ticket={ticket}/>
      </div>
    );
  }
}
