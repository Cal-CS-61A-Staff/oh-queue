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

// Helper Function
function scrollBottom() {
  $('html, body').animate({
    scrollTop: $(document).height()
  }, 600);
}

function toggleHelpForm() {
  $('#help-form-container').slideToggle('medium');
  $('#add-ticket').slideToggle('medium');
}

$(document).ready(function(){

  requestNotificationPermission();

  // Add event listeners
  $('#add-ticket').click(function() {
    toggleHelpForm();
    scrollBottom();
  });

  $('#cancel-form').click(function() {
    toggleHelpForm();
  })

  // Bind event listeners
  $('body').on('click', '[data-url]', function(event) {
    var confirmQ = $(this).attr('data-confirm');
    if (typeof confirmQ === 'string') {
      if (!confirm(confirmQ)) return;
    }
    $.post($(this).attr('data-url'));
  });
});
