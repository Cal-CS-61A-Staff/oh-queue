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
  $('body').on('click', '.resolve', function(event) {
    $.post($(this).attr('data-url'));
  });

  $('#help-form').submit(function(event) {
    NProgress.start();
    event.preventDefault();

    var request = $.post('/create/', {
      name: $('#name').val(),
      location: $('#location').val(),
      assignment_type: $('#assignment_type').val(),
      assignment: $('#assignment').val(),
      question: $('#question').val()
    });

    request.done(function(msg) {
      toggleHelpForm();
      NProgress.done();
      if (msg.result === 'failure') {
        alert('Your help request could not be added. Possible reason: ' + msg.error);
      }
    })
    .fail(function (msg) {
      toggleHelpForm();
      NProgress.done();
      // Currently, the alert doesn't work and no messages are displayed
      alert('Your help request could not be added.');
    });
  });

  socket.on('create', function(message) {
    console.log('create', message);
    $('#queue').append(message.assist_html);
    var details = {
      body: message.user_name + " - " + message.assignment + message.question + " in " + message.location
    }
    notifyUser("OH Queue: " + message.user_name + " in " + message.location, details);
  });

  socket.on('resolve', function (message) {
    console.log('resolve', message);
    if (message.user_id == current_user_id) {
      notifyUser("61A Queue: Your name has been called", {});
    }
    $('#queue-ticket-' + message.id).remove();
    $('#resolved').append(message.html);
  });
});
