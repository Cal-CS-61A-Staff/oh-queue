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

// The one and only app. Other components may reference this variable.
// See components/app.js for more documentation
let app = ReactDOM.render(<App/>, document.getElementById('content'));
