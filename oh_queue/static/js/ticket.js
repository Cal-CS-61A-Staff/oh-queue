$(document).ready(function(){
  var socket = io.connect('http://' + document.domain + ':' + location.port);
  
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
    console.log('cancel', message);
    $('#ticket').replaceWith(message.html);
  });
});
