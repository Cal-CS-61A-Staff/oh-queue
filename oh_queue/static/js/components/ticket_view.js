class TicketView extends React.Component {
  constructor(props) {
    super(props);

    this.assign = this.assign.bind(this);
    this.delete = this.delete.bind(this);
    this.resolveAndNext = this.resolveAndNext.bind(this);
    this.resolve = this.resolve.bind(this);
    this.unassign = this.unassign.bind(this);
    this.reassign = this.reassign.bind(this);
    this.next = this.next.bind(this);
  }

  assign() {
    let ticketID = this.props.params.id;
    socket.emit('assign', ticketID);
  }

  delete() {
    let ticketID = this.props.params.id;
    if (!confirm("Delete this ticket?")) return;
    socket.emit('delete', ticketID);
  }

  resolveAndNext() {
    let ticketID = this.props.params.id;
    socket.emit('resolve', ticketID, goToTicket)
  }

  resolve() {
    let ticketID = this.props.params.id;
    socket.emit('resolve', ticketID);
  }

  unassign() {
    let ticketID = this.props.params.id;
    socket.emit('unassign', ticketID);
  }

  reassign() {
    let ticketID = this.props.params.id;
    if (!confirm("Reassign this ticket?")) return;
    socket.emit('assign', ticketID);
  }

  next() {
    let ticketID = this.props.params.id;
    socket.emit('next', ticketID, goToTicket);
  }

  render() {

    if (this.props.tickets.length == 0) {
      return (
        <div></div>
      );
    }

    let ticket = this.props.tickets.filter((ticketArray) => ticketArray[0] == this.props.params.id)[0][1];

    return(
      <div id="ticket">
        <div className="row ticket">
          <div className="col-xs-12">

            <h2 className="text-center">
              { ticket.user_name }
              <small className="clearfix">{ ticket.created } in { ticket.location }</small>
            </h2>

            <p className="lead text-center">
            {(() => {
              if (ticket.status == "assigned") {
                return "Being helped by " + ticket.helper_name;
              } else if (ticket.status == "resolved") {
                return "Resolved by " + ticket.helper_name;
              } else if (ticket.status == "deleted") {
                return "Deleted";
              }
            })()}
            </p>

            <h3 className="text-center">
              <span className="label label-default">{ ticket.assignment } Q{ ticket.question }</span>
            </h3>

          </div>
        </div>

        <div className="row">
          {(() => {
            if (ticket.status == "pending") {
              return (

                <div className="col-xs-12 col-sm-6 col-sm-offset-3 col-md-4 col-md-offset-4">
                  <div className="well">
                    <button onClick={this.assign}
                            className="btn btn-primary btn-lg btn-block staff-only">Help</button>
                    <hr className="staff-only"/>
                    <button onClick={this.delete}
                            className="btn btn-danger btn-lg btn-block">Delete</button>
                  </div>
                </div>

              );
            } else if (ticket.status == "assigned") {
              return (
                <div>
                  <div className={"col-xs-12 col-sm-6 col-sm-offset-3 col-md-4 col-md-offset-4 hidden user-" + ticket.helper_id + "-visible"}>
                    <div className="well">
                      <button onClick={this.resolveAndNext}
                              className="btn btn-primary btn-lg btn-block">Resolve and Next</button>
                      <button onClick={this.resolve}
                              className="btn btn-default btn-lg btn-block">Resolve</button>
                      <hr />
                      <button onClick={this.unassign}
                              className="btn btn-default btn-lg btn-block">Requeue</button>
                    </div>
                  </div>
                  <div className={"col-xs-12 col-sm-6 col-sm-offset-3 col-md-4 col-md-offset-4 user-" + ticket.helper_id + "-hidden staff-only"}>
                    <div className="well">
                      <button onClick={this.reassign}
                              className="btn btn-warning btn-lg btn-block">Reassign</button>
                      <button onClick={this.next}
                              className="btn btn-default btn-lg btn-block">Next Ticket</button>
                    </div>
                  </div>
                </div>

              );
            } else if (ticket.status == "resolved" || ticket.status == "deleted") {
              return (

                <div className="col-xs-12 col-sm-6 col-sm-offset-3 col-md-4 col-md-offset-4 staff-only">
                  <div className="well">
                    <button onClick={this.next}
                            className="btn btn-default btn-lg btn-block">Next Ticket</button>
                  </div>
                </div>

              );
            }
          })()}
        </div>
      </div>
    )
  }
}
