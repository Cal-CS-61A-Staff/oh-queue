$(document).ready(function(){

  // helper functions
  var resolveHandler = function (event) {
     var url = $(this).attr('data-url');
     var postData = {
      id: $(this).attr('data-id')
     };
     $.post(url, postData, function(data) {
          //nothing needs to be done here
      });

  };

  // Bind event listeners
  $('.resolve').click(resolveHandler);
  requestNotificationPermission();

  // opening Socket
  var socket = io.connect(
    'http://' + document.domain + ':' + location.port + '/assist'
  );

  // Socket handler for adding entries
  socket.on('add_entry_response', function(message) {
      $('#queue').append(message.html);
      $('#resolve-' + message.id).click(resolveHandler);
      var details = {
          body: message.name + " - " + message.assignment + message.question + " in " + message.location
      }
      notifyUser("OH Queue: " + message.name + " in " + message.location, details);
  });

  socket.on('resolve_entry_response', function (message) {
      $('#queue-entry-' + message.id).remove();
      $('#resolved').append(message.html);
  });
});
