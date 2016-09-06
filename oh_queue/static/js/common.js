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
declare var is_staff: bool;

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
  tickets: Map<number, Ticket>
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
      tickets: new Map(),
    };

    var socket = connectSocket();

    socket.on('state', (state: ServerState) => {
      const tickets = new Map(
        state.tickets.map((ticket) => [ticket.id, ticket])
      );
      this.setState({
        tickets,
      })
    });

    socket.on('event', (event: TicketEvent) => {
      const ticket = event.ticket;
      const tickets = this.state.tickets.set(ticket.id, ticket);
      this.setState({
        tickets,
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

const StaffLink = (props) => {
  if (is_staff) {
    return <ReactRouter.Link {...props}></ReactRouter.Link>
  } else {
    return <div {...props}></div>
  }
}

const Queue = (props: State) => {
  let tickets = Array.from(props.tickets.values());
  tickets.sort((a, b) => b.id - a.id);
  return (
    <div className="queue">
      { tickets.map(ticket => <TicketRow ticket={ticket}/>) }
    </div>
  );
}

const TicketRow = (props: {ticket: Ticket}) => {
  const ticket = props.ticket;
  return (
    <StaffLink className="queue-ticket row staff-link" to={ '/' + ticket.id }>
      <div className="two columns">{ ticket.user_name }</div>
      <div className="two columns">{ ticket.created }</div>
      <div className="two columns">{ ticket.location }</div>
      <div className="two columns">{ ticket.assignment }</div>
      <div className="two columns">{ ticket.question }</div>
      <div className="two columns">{ ticketStatus(ticket) }</div>
    </StaffLink>
  )
}

type TicketPageParams = {
  params: {
    ticket_id: number,
  },
};

const TicketPage = (props: State & TicketPageParams) => {
  const ticket = props.tickets.get(props.params.ticket_id);
  if (ticket == null) {
    return <div></div>;  // TODO
  }
  const help = <button data-url="/delete"
          data-confirm="Delete this ticket?"
          className="btn delete">Delete</button>
  return (
    <div id="ticket" className="container">
      <ReactRouter.Link to='/'>View Queue</ReactRouter.Link>
      <div className="row">Name: <span className="name">{ ticket.user_name }</span></div>
      <div className="row">Queue Time: <span className="created">{ ticket.created }</span></div>
      <div className="row">Location: <span className="location">{ ticket.location }</span></div>
      <div className="row">Assignment: <span className="assignment">{ ticket.assignment }</span></div>
      <div className="row">Question: <span className="question">{ ticket.question }</span></div>
      <div className="row">Status: <span className="status">{ ticketStatus(ticket) }</span></div>
    </div>
  );
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
