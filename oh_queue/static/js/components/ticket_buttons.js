class TicketButtons extends React.Component {
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
    socket.emit('assign', this.props.ticket.id);
  }

  delete() {
    if (!confirm("Delete this ticket?")) return;
    socket.emit('delete', this.props.ticket.id);
  }

  resolveAndNext() {
    socket.emit('resolve', this.props.ticket.id, goToTicket)
  }

  resolve() {
    socket.emit('resolve', this.props.ticket.id);
  }

  unassign() {
    socket.emit('unassign', this.props.ticket.id);
  }

  reassign() {
    if (!confirm("Reassign this ticket?")) return;
    socket.emit('assign', this.props.ticket.id);
  }

  next() {
    socket.emit('next', this.props.ticket.id, goToTicket);
  }

  render() {
    let {state, ticket} = this.props;
    let staff = isStaff(state);

    function makeButton(text, style, action) {
      return (
        <button onClick={action}
          className={`btn btn-${style} btn-lg btn-block`}>
          {text}
        </button>
      );
    }

    let topButtons = [];
    let bottomButtons = [];

    if (ticket.status === 'pending') {
      bottomButtons.push(makeButton('Delete', 'danger', this.delete));
    }
    if (staff && ticket.status === 'pending') {
      topButtons.push(makeButton('Help', 'primary', this.assign));
    }
    if (staff && ticket.status === 'assigned') {
      if (ticket.helper.id === state.currentUser.id) {
        topButtons.push(makeButton('Resolve and Next', 'primary', this.resolveAndNext));
        topButtons.push(makeButton('Resolve', 'default', this.resolve));
        bottomButtons.push(makeButton('Requeue', 'default', this.assign));
      } else {
        topButtons.push(makeButton('Reassign', 'warning', this.reassign));
        topButtons.push(makeButton('Next Ticket', 'default', this.next));
      }
    }
    if (staff && (ticket.status === 'resolved' || ticket.status === 'deleted')) {
      topButtons.push(makeButton('Next Ticket', 'default', this.next));
    }

    let hr = topButtons.length && bottomButtons.length ? <hr/> : null;

    if (!(topButtons.length || bottomButtons.length)) {
      return null;
    }

    return (
      <div className="row">
        <div className="col-xs-12 col-sm-6 col-sm-offset-3 col-md-4 col-md-offset-4">
          <div className="well">
            {topButtons}
            {hr}
            {bottomButtons}
          </div>
        </div>
      </div>
    );
  }
}
