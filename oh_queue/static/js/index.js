$(document).ready(function(){
  var socket = io.connect('http://' + document.domain + ':' + location.port);
  
  socket.on('create', function(message) {
    console.log('create', message);
    $('#queue').append(message.row_html);
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
      notifyUser("61A Queue: Your name has been called by " + message.helper_name, {});
    }
    $('#queue-ticket-' + message.id).replaceWith(message.row_html);
  });

  socket.on('unassign', function (message) {
    console.log('unassign', message);
    $('#queue-ticket-' + message.id).replaceWith(message.row_html);
  });
  
  socket.on('cancel', function (message) {
    console.log('cancel', message);
    $('#queue-ticket-' + message.id).remove();
  });
});
