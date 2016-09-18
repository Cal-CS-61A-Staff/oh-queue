class TicketView extends React.Component {



  render() {

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
                    <button data-url={"/" + ticket.id + "/assign/"}
                            className="btn btn-primary btn-lg btn-block staff-only">Help</button>
                    <hr className="staff-only"/>
                    <button data-url="{{ url_for('delete', ticket_id=ticket.id) }}"
                            data-confirm="Delete this ticket?"
                            className="btn btn-danger btn-lg btn-block">Delete</button>
                  </div>
                </div>

              );
            } else if (ticket.status == "assigned") {
              return (
                <div>
                  <div className="col-xs-12 col-sm-6 col-sm-offset-3 col-md-4 col-md-offset-4 hidden user-{{ ticket.helper_id }}-visible">
                    <div className="well">
                      <button data-url="{{ url_for('resolve', ticket_id=ticket.id) }}"
                              className="btn btn-primary btn-lg btn-block"
                              data-redirect="{{ url_for('next_ticket') }}">Resolve and Next</button>
                      <button data-url="{{ url_for('resolve', ticket_id=ticket.id) }}"
                              className="btn btn-default btn-lg btn-block">Resolve</button>
                      <hr />
                      <button data-url="{{ url_for('unassign', ticket_id=ticket.id) }}"
                              className="btn btn-default btn-lg btn-block">Requeue</button>
                    </div>
                  </div>
                  <div className="col-xs-12 col-sm-6 col-sm-offset-3 col-md-4 col-md-offset-4 user-{{ ticket.helper_id }}-hidden staff-only">
                    <div className="well">
                      <button data-url="{{ url_for('assign', ticket_id=ticket.id) }}"
                              data-confirm="Reassign this ticket?"
                              className="btn btn-warning btn-lg btn-block">Reassign</button>
                      <a href="{{ url_for('next_ticket') }}" className="btn btn-default btn-lg btn-block">Next Ticket</a>
                    </div>
                  </div>
                </div>

              );
            } else if (ticket.status == "resolved" || ticket.status == "deleted") {
              return (

                <div className="col-xs-12 col-sm-6 col-sm-offset-3 col-md-4 col-md-offset-4 staff-only">
                  <div className="well">
                    <a href="{{ url_for('next_ticket') }}" className="btn btn-default btn-lg btn-block">Next Ticket</a>
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