$(document).ready(function(){
  var socket = io.connect('http://' + document.domain + ':' + location.port);
  
  socket.on('resolve', function (message) {
    $('#ticket').replaceWith(message.html);
  });

  socket.on('assign', function (message) {
    if (message.user_id == current_user_id) {
      notifyUser("61A Queue: Your name has been called by " + message.helper_name, {});
    }
    $('#ticket').replaceWith(message.html);
  });

  socket.on('unassign', function (message) {
    $('#ticket').replaceWith(message.html);
  });

  socket.on('delete', function (message) {
    $('#ticket').replaceWith(message.html);
  });
});
