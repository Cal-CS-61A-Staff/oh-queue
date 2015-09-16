$(document).ready(function(){
    var resolveHandler = function (event) { 
           var url = $(this).attr('data-url');
           var postData = {
            id: $(this).attr('data-id')
           };
           $.post(url, postData, function(data) {
                //nothing needs to be done here
            });

         };

    $('.resolve').click(resolveHandler);

	// Variables
	var socket = io.connect('http://' + document.domain + ':' + location.port);

	socket.on('connect', function() {
        socket.emit('connect');
    });

    // Socket handler for adding entries
    socket.on('add_entry_response', function(message) {
        $('#queue').append('\
            <div class="row queue-entry" id="queue-entry-' + message.id + '"> \
                <div class="three columns no-hide">' + message.name + '</div> \
                <div class="three columns">' + message.add_date+ '</div> \
                <div class="two columns">' + message.location+ '</div> \
                <div class="two columns">' + message.assignment_type + '</div> \
                <div class="two columns">' + message.assignment + '</div> \
                <div class="two columns">' + message.question + '</div> \
                <div class="two columns"><button data-url="/resolve_entry" \
                    data-id="' + message.id + '" class="resolve" id="resolve-' + message.id + '">Resolve</button></div> \
            '
        );
        $('#resolve-' + message.id).click(resolveHandler);
    });

    socket.on('resolve_entry_response', function (message) {
        $('#queue-entry-' + message.id).remove();
        $('#resolved').append('\
            <div class="row queue-entry" id="queue-entry-' + message.id + '"> \
                <div class="three columns no-hide">' + message.name + '</div> \
                <div class="three columns">' + message.add_date+ '</div> \
                <div class="two columns">' + message.location+ '</div> \
                <div class="two columns">' + message.assignment_type + '</div> \
                <div class="two columns">' + message.assignment + '</div> \
                <div class="two columns">' + message.question + '</div> \
            </div>'
        );
        $('#resolved-entry-notes-' + message.id + '> button').click(function(event) {
            addNotesId = $(this).attr('data-id');
          dialog.dialog( "open" );
        });
    });

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