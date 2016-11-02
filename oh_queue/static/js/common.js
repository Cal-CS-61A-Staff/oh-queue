function requestNotificationPermission() {
  Push.Permission.request(null, function() {
    console.log("Permission denied for notifications");
  })
}

function notifyUser(title, body) {
  Push.create(title, {
    'body': body,
    'icon': window.location.origin + "/static/img/logo-tiny.png",
     onClick: function () {
        window.focus();
        this.close();
    }
  });
}

function connectSocket() {
  return io.connect('//' + document.domain + ':' + location.port, {
    transports: ['websocket', 'polling'],
  });
}

// The one and only app. Other components may reference this variable.
// See components/app.js for more documentation
let app = ReactDOM.render(<App/>, document.getElementById('content'));
