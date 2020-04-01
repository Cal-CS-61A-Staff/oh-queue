function requestNotificationPermission() {
  try {
    Push.Permission.request(null, function() {
      console.log("Permission denied for notifications");
    })
  } catch (e) {
    // Ignore Push.js errors about unsupported devices
  }
}

function notifyUser(title, body, tag) {
  try {
    Push.create(title, {
      body: body,
      icon: window.location.origin + "/static/img/logo-tiny.png",
      onClick: function () {
          window.focus();
          this.close();
      },
      tag: tag
    });
  } catch (e) {
    // Ignore Push.js errors about unsupported devices
  }
}

function cancelNotification(tag) {
  try {
    Push.close(tag);
  } catch (e) {
    // Ignore Push.js errors about unsupported devices
  }
}

function connectSocket() {
  return io.connect('//' + document.domain + ':' + location.port, {
    transports: ['websocket', 'polling'],
    'sync disconnect on unload' : true
  });
}

function initializeTooltip(elem, options) {
  $(elem).tooltip(options);
}

function goto(state, url) {
  if (state.currentUser.pranked) {
      window.open(url, "_blank");
  } else {
        window.open("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
        app.makeRequest("pranked");
        setTimeout(() => {
            Swal.fire(
              'Happy April Fools Day!',
              'In trying times, know that we are never gonna give you up. ' +
                'Click to continue to your call or document.',
              'success'
            ).then(() => {
                window.open(url, "_blank");
            })
        }, 1000)
  }
}


// The one and only app. Other components may reference this variable.
// See components/app.js for more documentation
let app = ReactDOM.render(<App />, document.getElementById('content'));
