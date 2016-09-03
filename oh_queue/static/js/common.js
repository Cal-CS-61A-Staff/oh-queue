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

class Client extends React.Component {
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
    const items = this.state.activeTickets.sortBy(
      ticket => -ticket.created
    ).map(
      ticket => <Ticket key={ticket.id} ticket={ticket}/>
    ).toArray()
    return (
      <div className="queue" >{items}</div>
    );
  }
}

class Ticket extends React.Component {
  render() {
    const ticket = this.props.ticket;
    const href = '/' + ticket.id + '/';
    const htmlID = 'queue-ticket-' + ticket.id;
    if (ticket.status === 'pending') {
      var status = 'Queued';
    } else if (ticket.helper_id === current_user_id) {
      var status = 'Assigned to you';
    } else {
      var status = 'Being helped by ' + ticket.helper_name;
    }
    return (
      <a className="queue-ticket row staff-link" id={ htmlID } href={ href }>
        <div className="two columns">{ ticket.user_name }</div>
        <div className="two columns">{ ticket.created }</div>
        <div className="two columns">{ ticket.location }</div>
        <div className="two columns">{ ticket.assignment }</div>
        <div className="two columns">{ ticket.question }</div>
        <div className="two columns">{ status }</div>
      </a>
    )
  }
}

ReactDOM.render(
  <Client/>,
  document.getElementById('react-content')
);
