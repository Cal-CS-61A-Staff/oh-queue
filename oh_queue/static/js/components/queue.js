class Queue extends React.Component {
  render() {

    const items = this.props.tickets.sort((a, b) => a[1].created > b[1].created)
                                      .map((ticket) => <Ticket key={ticket[0]} ticket={ticket[1]} />);

    return(
      <div>
        {(() => { 
          if (!this.props.isStaff) { 
            return (
              <Jumbotron 
                isAuthenticated={this.props.isAuthenticated}
                shortName={this.props.shortName}
                email={this.props.email}
                myTicket={this.props.myTicket}
              />
            );
          } else {
            return "";
          }
        })()}

        <div id="queue" className="queue container">
          <div className="row">
            <div className="col-xs-3 col-sm-2">Name</div>
            <div className="hidden-xs col-sm-2 ">Queue Time</div>
            <div className="col-xs-3 col-sm-2">Location</div>
            <div className="col-xs-3 col-sm-2">Assignment</div>
            <div className="hidden-xs col-sm-2">Question</div>
            <div className="col-xs-3 col-sm-2">Status</div>
          </div>

          <div className="queue">{items}</div>
        </div>

      </div>

    );
  }
}