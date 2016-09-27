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

function goToTicket(nextTicketID) {
  let url = nextTicketID ? '/' + nextTicketID : '/';
  ReactRouter.browserHistory.push(url);
}

let app = ReactDOM.render(<App/>, document.getElementById('content'));

let socket = connectSocket();
socket.on('state', (data) => app.updateState(data));
socket.on('event', (data) => app.updateTicket(data.ticket));
