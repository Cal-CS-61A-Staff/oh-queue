$(document).ready(function(){
  requestNotificationPermission();

  // Bind event listeners
  $('body').on('click', '.resolve', function(event) {
    var url = $(this).attr('data-url');
    $.post(url, {
      id: $(this).attr('data-id')
    });
  });

  // opening Socket
  var socket = io.connect(
    'http://' + document.domain + ':' + location.port + '/assist'
  );

  // Socket handler for adding tickets
  socket.on('add_ticket_response', function(message) {
    $('#queue').append(message.html);
    var details = {
      body: message.name + " - " + message.assignment + message.question + " in " + message.location
    }
    notifyUser("OH Queue: " + message.name + " in " + message.location, details);
  });

  socket.on('resolve_ticket_response', function(message) {
    $('#queue-ticket-' + message.id).remove();
    $('#resolved').append(message.html);
  });
});
