let GroupActions = ({state, status, tickets, selectedTickets}) => {
  if (!isStaff(state)) return null;
  let ticket_ids = tickets.map(ticket => ticket.id);
  let handleActionSelected = (action) => {
    let selected_ticket_ids = selectedTickets.map(ticket => ticket.id);
    app.makeRequest(action, selected_ticket_ids);
  }
  var buttons;
  if (status === 'pending') {
    buttons = [
      <button onClick={() => handleActionSelected('assign')}
      className="btn btn-primary pull-right">
      Help selected
      </button>,
      <button onClick={() => handleActionSelected('delete')}
      className="btn btn-danger pull-right">
      Delete selected
      </button>,
      <button onClick={() => app.makeRequest('assign', ticket_ids)}
      className="btn btn-primary pull-right">
      Help all
      </button>,
      <button onClick={() => {
        if (!confirm(`Are you sure you want to delete ${tickets.length} requests?`)) return;
        app.makeRequest('delete', ticket_ids);
      }} className="btn btn-danger pull-right">
      Delete all
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
      <button onClick={() => app.makeRequest('resolve', ticket_ids)}
      className="btn btn-primary pull-right">
      Resolve all
      </button>,
      <button onClick={() => app.makeRequest('unassign', ticket_ids)}
      className="btn btn-warning pull-right">
      Requeue all
      </button>
    ];
  }

  return (
    <div className="group-actions clearfix">
      {buttons}
      <p className="pull-right">{tickets.length} total</p>
    </div>
  );
};
