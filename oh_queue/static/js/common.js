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
// TODO more interfaces
declare var $: any;
declare var io: (url: string, options: any) => any;
declare var React: any;
declare var ReactDOM: any;

type Ticket = {
  id: number,
  status: 'pending' | 'assigned' | 'resolved' | 'deleted',
  userID: number,
  userName: string,
  created: string,
  location: string,
  assignment: string,
  question: string,
  helperID: ?number,
  helperName: ?string,
};

type State = {
  // map ticket id to ticket info for all known tickets
  tickets: Map<number, Ticket>,
};

type InitialStateMessage = {
  tickets: Array<Ticket>,
};

type EventMessage = {
  ticket: Ticket,
};

// set in HTML
declare var currentUserID: number;
declare var isStaff: bool;
declare var pageInitialStateMessage: InitialStateMessage;

function initialState({tickets}: InitialStateMessage): State {
  return {
    tickets: new Map(tickets.map(ticket => [ticket.id, ticket])),
  };
}

function updateState(state: State, {ticket}: EventMessage): State {
  state.tickets.set(ticket.id, ticket);
  return state;
}

function ticketStatus(ticket: Ticket): string {
  if (ticket.status === 'assigned') {
    if (ticket.helperID === currentUserID) {
      return 'Assigned to you';
    } else if (ticket.helperName) {
      return 'Being helped by ' + ticket.helperName;
    }
  } else if (ticket.status === 'resolved') {
    return 'Resolved';
  } else if (ticket.status === 'deleted') {
    return 'Deleted';
  } else if (ticket.status === 'pending') {
    return 'Queued';
  }
  throw Error('Unknown ticket status');
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
    this.state = initialState(pageInitialStateMessage);

    var socket = connectSocket();

    socket.on('initial-state', (data: InitialStateMessage) => {
      this.setState(initialState(data));
    });

    socket.on('event', (data: EventMessage) => {
      this.setState(updateState(this.state, data));
    });
  }

  render() {
    // Pass state to children in props
    return React.cloneElement(this.props.children, {state: this.state});
  }
}

const StaffLink = (props) => {
  if (isStaff) {
    return <ReactRouter.Link {...props}/>
  } else {
    return <div {...props}/>
  }
}

const Queue = ({state}: {state: State}) => {
  const activeTickets = Array.from(state.tickets.values()).filter(ticket =>
    ticket.status === 'pending' || ticket.status === 'assigned'
  ).sort((a, b) => b.id - a.id);
  return (
    <div className="queue">
      { activeTickets.map(ticket => <TicketRow ticket={ticket}/>) }
    </div>
  );
}

const TicketRow = ({ticket}: {ticket: Ticket}) => {
  return (
    <StaffLink className="queue-ticket row staff-link" to={ '/' + ticket.id }>
      <div className="two columns">{ ticket.userName }</div>
      <div className="two columns">{ ticket.created }</div>
      <div className="two columns">{ ticket.location }</div>
      <div className="two columns">{ ticket.assignment }</div>
      <div className="two columns">{ ticket.question }</div>
      <div className="two columns">{ ticketStatus(ticket) }</div>
    </StaffLink>
  )
}

const TicketPage = (
  {state, params}: {state: State, params: {ticketID: number}}
) => {
  const ticket = state.tickets.get(params.ticketID);
  if (ticket == null) {
    return <div></div>;  // TODO
  }
  const help = <button data-url="/delete"
          data-confirm="Delete this ticket?"
          className="btn delete">Delete</button>
  return (
    <div id="ticket" className="container">
      <ReactRouter.Link to='/'>View Queue</ReactRouter.Link>
      <div className="row">Name: <span className="name">{ ticket.userName }</span></div>
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
      <ReactRouter.Route path=":ticketID" component={TicketPage} />
    </ReactRouter.Route>
  </ReactRouter.Router>,
  document.getElementById('react-content')
);
