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
