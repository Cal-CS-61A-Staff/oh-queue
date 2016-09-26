class Ticket extends React.Component {
  render() {
    const ticket = this.props.ticket;
    const href = '/' + ticket.id + '/';
    const htmlID = 'queue-ticket-' + ticket.id;
    if (ticket.status === 'pending') {
      var status = 'Queued';
    } else if (ticket.helper_id === this.props.currentUserID) {
      var status = 'Assigned to you';
    } else {
      var status = 'Being helped by ' + ticket.helper_name;
    }

    if (ticket.status == "deleted" || ticket.status == "resolved") {
      return (<div></div>);
    }

    var ticketRow;
    if (this.props.isAuthenticated) {
      ticketRow =
        <ReactRouter.Link to={ href } className={"staff-link user-" + ticket.user_id + "-link"}>
          <div className="col-xs-3 col-sm-2 truncate">{ ticket.user_name }</div>
          <div className="hidden-xs col-sm-2 truncate">{ ticket.created }</div>
          <div className="col-xs-3 col-sm-2 truncate">{ ticket.location }</div>
          <div className="col-xs-3 col-sm-2 truncate">{ ticket.assignment }</div>
          <div className="hidden-xs col-sm-2 truncate">{ ticket.question }</div>

          {(() => {

            if (ticket.status == 'pending') {
              return (
                <div className="col-xs-3 col-sm-2 truncate">Queued</div>
              );
            } else if (ticket.status == 'assigned') {
              return (
                <div>
                  <div className={"col-xs-3 col-sm-2 user-" + ticket.helper_id + "-hidden truncate"}>Being helped by { ticket.helper_name }</div>
                  <div className={"col-xs-3 col-sm-2 hidden user-" + ticket.helper_id + "-visible truncate"}>Assigned to you</div>
                </div>
              );
            }

          })()}

         </ReactRouter.Link>
    } else {
      ticketRow =
        <a href="/login/" className={"staff-link user-" + ticket.user_id + "-link"}>
          <div className="col-xs-3 col-sm-2 truncate">{ ticket.user_name }</div>
          <div className="hidden-xs col-sm-2 truncate">{ ticket.created }</div>
          <div className="col-xs-3 col-sm-2 truncate">{ ticket.location }</div>
          <div className="col-xs-3 col-sm-2 truncate">{ ticket.assignment }</div>
          <div className="hidden-xs col-sm-2 truncate">{ ticket.question }</div>

          {(() => {

            if (ticket.status == 'pending') {
              return (
                <div className="col-xs-3 col-sm-2 truncate">Queued</div>
              );
            } else if (ticket.status == 'assigned') {
              return (
                <div>
                  <div className={"col-xs-3 col-sm-2 user-" + ticket.helper_id + "-hidden truncate"}>Being helped by { ticket.helper_name }</div>
                  <div className={"col-xs-3 col-sm-2 hidden user-" + ticket.helper_id + "-visible truncate"}>Assigned to you</div>
                </div>
              );
            }

          })()}

         </a>
    }

    return (
      <div className={"row user-" + ticket.user_id  + "-highlight"} id={ htmlID }>
        {ticketRow}
      </div>
    )
  }
}
