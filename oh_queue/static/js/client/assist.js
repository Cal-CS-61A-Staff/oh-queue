$(document).ready(function(){
  var titleToggleTimer = null;
  var startTitle = document.title;

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

  var toggleTitle = function() {
      if (document.title == startTitle) {
          document.title = "NEW STUDENT ON QUEUE";
      }
      else {
          document.title = startTitle;
      }
      titleToggleTimer = setTimeout(toggleTitle, 1000);
  }

  var resetTitle = function() {
      clearTimeout(titleToggleTimer);
      titleToggleTimer = null;
      document.title = startTitle;
  }

  // Bind event listeners
  $('.resolve').click(resolveHandler);

  // opening Socket
	var socket = io.connect('http://' + document.domain + ':' + location.port);
	socket.on('connect', function() {
        socket.emit('connect');
    });

  // Socket handler for adding entries
  socket.on('add_entry_response', function(message) {
      $('#queue').append(formatMessage(message, true));
      $('#resolve-' + message.id).click(resolveHandler);
      if (!titleToggleTimer) {
          toggleTitle();
      }
  });

  socket.on('resolve_entry_response', function (message) {
      $('#queue-entry-' + message.id).remove();
      $('#resolved').append(formatMessage(message, false));
      
      if (titleToggleTimer){
          resetTitle();
      }
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
