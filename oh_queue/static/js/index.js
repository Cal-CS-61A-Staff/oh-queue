$(document).ready(function(){
  var socket = io.connect('http://' + document.domain + ':' + location.port);
  
  socket.on('create', function(message) {
    $('#queue').append(message.row_html);
    var details = {
      body: message.user_name + " - " + message.assignment + message.question + " in " + message.location
    }
    notifyUser("OH Queue: " + message.user_name + " in " + message.location, details);
  });

  socket.on('resolve', function (message) {
    $('#queue-ticket-' + message.id).remove();
  });

  socket.on('assign', function (message) {
    if (message.user_id == current_user_id) {
      notifyUser("61A Queue: Your name has been called by " + message.helper_name, {});
    }
    $('#queue-ticket-' + message.id).replaceWith(message.row_html);
  });

  socket.on('unassign', function (message) {
    $('#queue-ticket-' + message.id).replaceWith(message.row_html);
  });
  
  socket.on('delete', function (message) {
    $('#queue-ticket-' + message.id).remove();
  });
});
