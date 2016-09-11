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
  return io.connect('//' + document.domain + ':' + location.port, {
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
  <ReactRouter.Router history={ReactRouter.browserHistory}>
    <ReactRouter.Route path="/" component={App}></ReactRouter.Route>
  </ReactRouter.Router>,

  document.getElementById('content')
);
