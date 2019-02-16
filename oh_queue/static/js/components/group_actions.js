let GroupActions = ({state, status, tickets, selectedTickets}) => {
  if (!isStaff(state)) return null;
  let ticket_ids = tickets.map(ticket => ticket.id);
  let handleDeleteSelected = () => {
    let selected_ticket_ids = selectedTickets.map(ticket => ticket.id);
    app.makeRequest('delete', selected_ticket_ids);
  }
  let handleHelpSelected = () => {
    let selected_ticket_ids = selectedTickets.map(ticket => ticket.id);
    app.makeRequest('assign', selected_ticket_ids);
  }
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
      <button onClick={handleHelpSelected}
      className="btn btn-primary pull-right">
      Help selected
      </button>,
      <button onClick={handleDeleteSelected}
      className="btn btn-primary pull-right">
      Delete selected
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
