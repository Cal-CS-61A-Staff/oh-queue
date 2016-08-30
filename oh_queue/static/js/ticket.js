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
  $('body').on('click', '.link', function(event) {
    var confirmQ = $(this).attr('data-confirm');
    if (typeof confirmQ === 'string') {
      if (!confirm(confirmQ)) return;
    }
    window.location.href = $(this).attr('data-url');
  });
  $('body').on('click', '.btn', function(event) {
    var confirmQ = $(this).attr('data-confirm');
    if (typeof confirmQ === 'string') {
      if (!confirm(confirmQ)) return;
    }
    $.post($(this).attr('data-url'));
  });
  
  $('body').on('click', '.staff-link', function(event) {
    if (!is_staff) return;
    var confirmQ = $(this).attr('data-confirm');
    if (typeof confirmQ === 'string') {
      if (!confirm(confirmQ)) return;
    }
    window.location.href = $(this).attr('data-url');
  });
  
  $('body').on('click', '.staff-btn', function(event) {
    if (!is_staff) return;
    var confirmQ = $(this).attr('data-confirm');
    if (typeof confirmQ === 'string') {
      if (!confirm(confirmQ)) return;
    }
    $.post($(this).attr('data-url'));
  });

  socket.on('resolve', function (message) {
    console.log('resolve', message);
    $('#ticket').replaceWith(message.html);
  });

  socket.on('assign', function (message) {
    console.log('assign', message);
    if (message.user_id == current_user_id) {
      notifyUser("61A Queue: Your name has been called by " + message.helper_name, {});
    }
    $('#ticket').replaceWith(message.html);
  });

  socket.on('unassign', function (message) {
    console.log('unassign', message);
    $('#ticket').replaceWith(message.html);
  });

  socket.on('cancel', function (message) {
    console.log('unassign', message);
    $('#ticket').replaceWith(message.html);
  });
});
