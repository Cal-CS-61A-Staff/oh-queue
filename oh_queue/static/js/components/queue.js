let Queue = ({state}) => {
  let items = getActiveTickets(state).map(ticket =>
    <Ticket state={state} ticket={ticket}/>
  );

  return (
    <div>
      <Jumbotron state={state}/>
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
