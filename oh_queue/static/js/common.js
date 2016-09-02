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
