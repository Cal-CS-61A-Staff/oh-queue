function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission !== 'denied') {
    Notification.requestPermission();
  }
}

function notifyUser(text, options) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(text, options);
  }
}

function connectSocket() {
  return io.connect('http://' + document.domain + ':' + location.port, {
    transports: ['websocket', 'polling'],
  });
}

$(document).ready(function(){
  // Bind event listeners
  $('body').on('click', '[data-url]', function(event) {
    var confirmQ = $(this).attr('data-confirm');
    if (typeof confirmQ === 'string') {
      if (!confirm(confirmQ)) return;
    }
    var redirectUrl = $(this).attr('data-redirect');
    $.post($(this).attr('data-url')).then(function (event) {
      if (typeof redirectUrl === 'string') {
        window.location.href = redirectUrl;
      }
    });
  });
});

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeTickets: Immutable.Map(),
    };

    var socket = connectSocket();

    socket.on('state', (state) => {
      const activeTickets = Immutable.Map(
        state.tickets.map((ticket) => [ticket.id, ticket])
      );
      this.setState({
        activeTickets,
      })
    });

    socket.on('event', (event) => {
      const ticket = event.ticket;
      const activeTickets = this.state.activeTickets.set(ticket.id, ticket);
      this.setState({
        activeTickets,
      })
    })
  }

  render() {
    // Pass state to children in props
    return (
      <div>{ React.cloneElement(this.props.children, this.state) }</div>
    );
  }
}

class Queue extends React.Component {
  render() {
    const items = this.props.activeTickets.sortBy(
      ticket => -ticket.created
    ).map(
      ticket => <TicketRow key={ticket.id} ticket={ticket}/>
    ).toArray()
    return (
      <div className="queue" >{items}</div>
    );
  }
}

class TicketRow extends React.Component {
  render() {
    const ticket = this.props.ticket;
    if (ticket.status === 'pending') {
      var status = 'Queued';
    } else if (ticket.helper_id === current_user_id) {
      var status = 'Assigned to you';
    } else {
      var status = 'Being helped by ' + ticket.helper_name;
    }
    return (
      <ReactRouter.Link className="queue-ticket row staff-link"
          to={ '/' + ticket.id }>
        <div className="two columns">{ ticket.user_name }</div>
        <div className="two columns">{ ticket.created }</div>
        <div className="two columns">{ ticket.location }</div>
        <div className="two columns">{ ticket.assignment }</div>
        <div className="two columns">{ ticket.question }</div>
        <div className="two columns">{ status }</div>
      </ReactRouter.Link>
    )
  }
}

class Ticket extends React.Component {
  render() {
    const ticket = this.props.activeTickets.get(this.props.params.ticket_id);
    return (
      <div id="ticket" class="container">
        <a href="{{ url_for('index') }}">View Queue</a>
        <div class="row">Name: <span class="name">{ ticket.user_name }</span></div>
        <div class="row">Queue Time: <span class="created">{ ticket.created }</span></div>
        <div class="row">Location: <span class="location">{ ticket.location }</span></div>
        <div class="row">Assignment: <span class="assignment">{ ticket.assignment }</span></div>
        <div class="row">Question: <span class="question">{ ticket.question }</span></div>
        <div class="row">
        {/* {% if ticket.status == TicketStatus.pending %}
          <div class="twelve columns">
            <button data-url="{{ url_for('assign', ticket_id=ticket.id) }}"
                    class="btn staff-only">Help</button>
          </div>
          <div class="twelve columns">
            <button data-url="{{ url_for('delete', ticket_id=ticket.id) }}"
                    data-confirm="Delete this ticket?"
                    class="btn delete">Delete</button>
          </div>
        {% elif ticket.status == TicketStatus.assigned %}
          <div class="twelve columns hidden user-{{ ticket.helper_id }}-visible">
            <button data-url="{{ url_for('unassign', ticket_id=ticket.id) }}">Put Back</button>
          </div>
          <div class="twelve columns hidden user-{{ ticket.helper_id }}-visible">
            <button data-url="{{ url_for('resolve', ticket_id=ticket.id) }}">
              Resolve
            </button>
          </div>
          <div class="twelve columns hidden user-{{ ticket.helper_id }}-visible">
            <button data-url="{{ url_for('resolve', ticket_id=ticket.id) }}"
                    data-redirect="{{ url_for('next_ticket') }}">Resolve and Next</button>
          </div>
          <div class="twelve columns user-{{ ticket.helper_id }}-hidden">Being helped by {{ ticket.helper.name }}</div>
          <div class="twelve columns user-{{ ticket.helper_id }}-hidden staff-only">
              <button data-url="{{ url_for('assign', ticket_id=ticket.id) }}"
                      data-confirm="Reassign this ticket?">Reassign</button>
          </div>
          <div class="twelve columns user-{{ ticket.helper_id }}-hidden staff-only">
            <a href="{{ url_for('next_ticket') }}" class="button">Next Ticket</a>
          </div>
        {% elif ticket.status == TicketStatus.resolved %}
          <div class="twelve columns">Resolved</div>
          <div class="twelve columns staff-only">
            <a href="{{ url_for('next_ticket') }}" class="button">Next Ticket</a>
          </div>
        {% elif ticket.status == TicketStatus.deleted %}
          <div class="twelve columns">Deleted</div>
          <div class="twelve columns staff-only">
            <a href="{{ url_for('next_ticket') }}" class="button">Next Ticket</a>
          </div>
        {% endif %} */}
        </div>
      </div>
    );
  }
}

ReactDOM.render(
  <ReactRouter.Router history={ReactRouter.browserHistory}>
    <ReactRouter.Route path="/" component={App}>
      <ReactRouter.IndexRoute component={Queue} />
      <ReactRouter.Route path=":ticket_id" component={Ticket} />
    </ReactRouter.Route>
  </ReactRouter.Router>,
  document.getElementById('react-content')
);
