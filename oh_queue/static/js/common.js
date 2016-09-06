// @flow

// Browser API
type NotificationOptions = {
  body?: string;
};

declare class Notification {
  static permission: string;
  static requestPermission(): void;
  constructor(message: string, options: NotificationOptions): Notification;
}

// External library declarations
declare var $: any;
declare var io: (url: string, options: any) => any;
declare var React: any;
declare var ReactDOM: any;

// External variables (set in HTML)
declare var current_user_id: number;

// Types
type TicketDetails = {
  id: number,
  user_id: number,
  user_name: string,
  created: string,
  location: string,
  assignment: string,
  question: string,
};

type UnassignedTicket = TicketDetails & {
  status: 'pending' | 'resolved' | 'deleted';
};

type AssignedTicket = TicketDetails & {
  status: 'assigned';
  helper_id: number;
  helper_name: string;
};

type Ticket = UnassignedTicket | AssignedTicket;

type ServerState = {
  tickets: Array<Ticket>
};

type TicketEvent = {
  ticket: Ticket
};

type State = {
  activeTickets: Map<number, Ticket>
}

function requestNotificationPermission(): void {
  if ('Notification' in window && Notification.permission !== 'denied') {
    Notification.requestPermission();
  }
}

function notifyUser(text: string, options: NotificationOptions): void {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(text, options);
  }
}

function connectSocket() {
  let domain = document.domain ? document.domain : 'unknown_domain';
  return io.connect('http://' + domain + ':' + location.port, {
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
  state: State;

  constructor(props) {
    super(props);
    this.state = {
      activeTickets: new Map(),
    };

    var socket = connectSocket();

    socket.on('state', (state: ServerState) => {
      const activeTickets = new Map(
        state.tickets.map((ticket) => [ticket.id, ticket])
      );
      this.setState({
        activeTickets,
      })
    });

    socket.on('event', (event: TicketEvent) => {
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

function ticketStatus(ticket: Ticket): string {
  if (ticket.status === 'assigned') {
    if (ticket.helper_id === current_user_id) {
      return 'Assigned to you';
    } else {
      return 'Being helped by ' + ticket.helper_name;
    }
  } else if (ticket.status === 'resolved') {
    return 'Resolved';
  } else if (ticket.status === 'deleted') {
    return 'Deleted';
  } else {
    return 'Queued';
  }
}

class TicketRow extends React.Component {
  render() {
    const ticket = this.props.ticket;
    return (
      <ReactRouter.Link className="queue-ticket row staff-link"
          to={ '/' + ticket.id }>
        <div className="two columns">{ ticket.user_name }</div>
        <div className="two columns">{ ticket.created }</div>
        <div className="two columns">{ ticket.location }</div>
        <div className="two columns">{ ticket.assignment }</div>
        <div className="two columns">{ ticket.question }</div>
        <div className="two columns">{ ticketStatus(ticket) }</div>
      </ReactRouter.Link>
    )
  }
}

class TicketPage extends React.Component {
  render() {
    const ticket = this.props.activeTickets.get(this.props.params.ticket_id);
    const help = <button data-url="/delete"
            data-confirm="Delete this ticket?"
            class="btn delete">Delete</button>
    return (
      <div id="ticket" class="container">
        <a href="{{ url_for('index') }}">View Queue</a>
        <div class="row">Name: <span class="name">{ ticket.user_name }</span></div>
        <div class="row">Queue Time: <span class="created">{ ticket.created }</span></div>
        <div class="row">Location: <span class="location">{ ticket.location }</span></div>
        <div class="row">Assignment: <span class="assignment">{ ticket.assignment }</span></div>
        <div class="row">Question: <span class="question">{ ticket.question }</span></div>
        <div class="row">Status: <span class="status">{ ticketStatus(ticket) }</span></div>
        {/* { buttons }
        pending:
          Help
          Delete
        assigned to you:
          Put Back
          Resolve
          Resolve and Next
        assigned to someone else:
          Reassign to you
          Next
        not assigned to you:
          Next */}

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
    );
  }
}

ReactDOM.render(
  <ReactRouter.Router history={ReactRouter.browserHistory}>
    <ReactRouter.Route path="/" component={App}>
      <ReactRouter.IndexRoute component={Queue} />
      <ReactRouter.Route path=":ticket_id" component={TicketPage} />
    </ReactRouter.Route>
  </ReactRouter.Router>,
  document.getElementById('react-content')
);
