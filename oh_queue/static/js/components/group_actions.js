let GroupActions = ({state, status, tickets, selectedTickets, handleActionSelected}) => {
  if (!isStaff(state)) return null;
  let ticket_ids = tickets.map(ticket => ticket.id);
  var buttons;
  if (status === 'pending') {
    buttons = [
      <button onClick={() => handleActionSelected('assign')}
      className="btn btn-primary pull-right">
      Help selected
      </button>,
      <button onClick={() => {
        if (!confirm(`Are you sure you want to delete ${selectedTickets.size} request(s)?`)) return;
        handleActionSelected('delete');}}
      className="btn btn-danger pull-right">
      Delete selected
      </button>
    ];
  } else if (status === 'assigned') {
    buttons = [
      <button onClick={() => handleActionSelected('resolve')}
      className="btn btn-warning pull-right">
      Resolve selected
      </button>,
      <button onClick={() => handleActionSelected('unassign')}
      className="btn btn-primary pull-right">
      Requeue selected
      </button>,
    ];
  }

  return (
    <div className="group-actions clearfix">
      {buttons}
      <p className="pull-right">{tickets.length} total</p>
    </div>
  );
};
