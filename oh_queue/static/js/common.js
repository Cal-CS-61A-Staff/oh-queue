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
      <div className={"row user-" + ticket.user_id  + "-highlight"} id={ htmlID }>
        <a className={"staff-link user-" + ticket.user_id + "-link"} href={ href }>
          <div className="col-xs-3 col-sm-2 truncate">{ ticket.user_name }</div>
          <div className="hidden-xs col-sm-2 truncate">{ ticket.created }</div>
          <div className="col-xs-3 col-sm-2 truncate">{ ticket.location }</div>
          <div className="col-xs-3 col-sm-2 truncate">{ ticket.assignment }</div>
          <div className="hidden-xs col-sm-2 truncate">{ ticket.question }</div>

          {(() => {

            if (ticket.status == 'pending') {
              return (
                <div className="col-xs-3 col-sm-2 truncate">Queued</div>
              );
            } else if (ticket.status == 'assigned') {
              return (
                <div>
                  <div className="col-xs-3 col-sm-2 user-{{ ticket.helper_id }}-hidden truncate">Being helped by { ticket.helper_name }</div>
                  <div className="col-xs-3 col-sm-2 hidden user-{{ ticket.helper_id }}-visible truncate">Assigned to you</div>
                </div>
              );
            }

          })()}

         </a>
      </div>
    )
  }
}



ReactDOM.render(
  <ReactRouter.Router history={ReactRouter.browserHistory}>
    <ReactRouter.Route path="/" component={App}></ReactRouter.Route>
  </ReactRouter.Router>,

  document.getElementById('content')
);
