$(document).ready(function(){
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

  requestNotificationPermission();
  // Variables
  var socket = io.connect('http://' + document.domain + ':' + location.port);

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

  // Add event listeners
  $('#add-ticket').click(function() {
    toggleHelpForm();
    scrollBottom();
  });

  $('#cancel-form').click(function() {
    toggleHelpForm();
  })

  // Bind event listeners
  $('body').on('click', '.event-btn', function(event) {
    $.post($(this).attr('data-url'));
  });

  socket.on('create', function(message) {
    console.log('create', message);
    $('#queue').append(message.html);
    var details = {
      body: message.user_name + " - " + message.assignment + message.question + " in " + message.location
    }
    notifyUser("OH Queue: " + message.user_name + " in " + message.location, details);
  });

  socket.on('resolve', function (message) {
    console.log('resolve', message);
    $('#queue-ticket-' + message.id).remove();
  });

  socket.on('assign', function (message) {
    console.log('assign', message);
    if (message.user_id == current_user_id) {
      notifyUser("61A Queue: Your name has been called", {});
    }
    $('#queue-ticket-' + message.id).replaceWith(message.html);
  });

  socket.on('unassign', function (message) {
    console.log('unassign', message);
    if (message.user_id == current_user_id) {
      notifyUser("61A Queue: You've been added back to the queue", {});
    }
    $('#queue-ticket-' + message.id).replaceWith(message.html);
  });
});
