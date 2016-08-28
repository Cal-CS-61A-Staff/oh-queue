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

  var formatMessage = function(message, resolveButton) {
    rendered =
      '<div class="row queue-entry" id="queue-entry-' + message.id + '"> \
            <div class="two columns no-hide">' + message.name + '</div> \
            <div class="three columns">' + message.add_date+ '</div> \
            <div class="two columns">' + message.location+ '</div> \
            <div class="two columns">' + message.assignment_type + '</div> \
            <div class="three columns">' + message.assignment + '</div> \
            <div class="two columns">' + message.question + '</div> \
      '
    resolve = 
      '<div class="two columns"><button data-url="/resolve_entry" \
      data-id="' + message.id + '" class="resolve" id="resolve-' + message.id + 
      '">Resolve</button></div>'
    if (resolveButton == true) {
      rendered = rendered + resolve
    }
    return rendered + '</div>'
  }

  // Bind event listeners
  $('.resolve').click(resolveHandler);


  function notifyUser(text, options) {
    // Let's check if the browser supports notifications
    if (!("Notification" in window)) {
      return;
    }
    // Let's check if the user is okay to get some notification
    else if (Notification.permission === "granted") {
      var notif = new Notification(text, options);
    } 

  // At last, if the user already denied any notification, and you
  // want to be respectful there is no need to bother him any more.
}
  // opening Socket
    var socket = io.connect('http://' + document.domain + ':' + location.port);
    socket.on('connect', function() {

      if (("Notification" in window)) {
        // Request notifictions
        Notification.requestPermission(function (permission) {
          // Whatever the user answers, we make sure we store the information
          if(!('permission' in Notification)) {
            Notification.permission = permission;
          }
        });
      }

    });

  // Socket handler for adding entries
  socket.on('add_entry_response', function(message) {
      $('#queue').append(formatMessage(message, true));
      $('#resolve-' + message.id).click(resolveHandler);
      var details = {
          body: message.name + " - " + message.assignment + message.question + " in " + message.location
      }
      notifyUser("OH Queue: " + message.name + " in " + message.location, details);
  });

  socket.on('resolve_entry_response', function (message) {
      $('#queue-entry-' + message.id).remove();
      $('#resolved').append(formatMessage(message, false));
      // $('#resolved-entry-notes-' + message.id + '> button').click(function(event) {
      //     addNotesId = $(this).attr('data-id');
      //   dialog.dialog( "open" );
      // });
  });

  // removed notes ability temporarily, kept the other functions un
  // touched so it could be added again.

  socket.on('notes_added', function (message) {
      $('#resolved-entry-notes-' + message.id + '> button').remove();
      $('#resolved-entry-notes-' + message.id).append('<p>' + message.notes + '</p>');
  });

  // For the adding notes modal
  var dialog, form, addNotesId,
    notes = $( "#notes" ),
    tips = $( ".validateTips" );

  function addNotes() {
      var postData = {
          id: addNotesId,
          notes: notes.val()
      };
     $.post('/add_notes', postData, function(data) {
          
      });        
     dialog.dialog( "close" );
  }

  dialog = $( "#dialog-form" ).dialog({
    autoOpen: false,
    height: 300,
    width: 350,
    modal: true,
    buttons: {
      "Add note": addNotes,
      Cancel: function() {
        dialog.dialog( "close" );
      }
    },
    close: function() {
      form[ 0 ].reset();
    }
  });

  form = dialog.find( "form" ).on( "submit", function( event ) {
    event.preventDefault();
    addNotes();
  });
});

