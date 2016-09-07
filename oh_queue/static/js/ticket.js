$(document).ready(function(){
  var socket = connectSocket();

  requestNotificationPermission();

  socket.on('assign', function (message) {
    if (message.user_id == current_user_id) {
      notifyUser("61A Queue: Your name has been called by " + message.helper_name, {});
    }
    updateTicket(message);
  });

  function updateTicket(message) {
    if (message.id === ticket_id) {
      $('#ticket').replaceWith(message.html);
    }
  }

  socket.on('unassign', updateTicket);

  socket.on('delete', updateTicket);

  socket.on('resolve', updateTicket);

});
