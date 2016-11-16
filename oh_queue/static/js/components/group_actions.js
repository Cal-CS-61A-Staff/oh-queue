let GroupActions = ({state, status, tickets}) => {
  if (!isStaff(state)) return null;
  let ticket_ids = tickets.map(ticket => ticket.id);
  var buttons;
  if (status === 'pending') {
    buttons = [
      <button onClick={() => {
        if (!confirm(`Are you sure you want to delete ${tickets.length} requests?`)) return;
        app.makeRequest('delete', ticket_ids);
      }} className="btn btn-danger pull-right">
        Delete all
      </button>,
      <button onClick={() => app.makeRequest('assign', ticket_ids)}
      className="btn btn-primary pull-right">
      Help all
      </button>,
    ];
  } else if (status === 'assigned') {
    buttons = [
      <button onClick={() => app.makeRequest('unassign', ticket_ids)}
        className="btn btn-warning pull-right">
        Requeue all
      </button>,
      <button onClick={() => app.makeRequest('resolve', ticket_ids)}
      className="btn btn-primary pull-right">
      Resolve all
      </button>,
    ];
  }

  return (
    <div className="group-actions clearfix">
      {buttons}
      <p className="pull-right">{tickets.length} selected</p>
    </div>
  );
};
