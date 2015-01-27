$(document).ready(function(){
    $('.resolve').click(function (event) { 
           console.log("Resolve clicked");
           var url = $(this).attr('data-url');
           var postData = {
            id: $(this).attr('data-id')
           };
           $.post(url, postData, function(data) {
                //nothing needs to be done here
            });

         });

	// Variables
	var socket = io.connect('http://' + document.domain + ':' + location.port);

	socket.on('connect', function() {
        socket.emit('connect');
    });

    // Socket handler for adding entries
    socket.on('add_entry_response', function(message) {
        $('#queue').append('\
            <div class="queue-entry row" id="queue-entry-' + message.id + '"> \
                <div class="three columns">' + message.name + '</div> \
                <div class="three columns">' + message.add_date + '</div> \
                <div class="three columns">' + message.assignment + '</div> \
                <div class="three columns">' + message.question + '</div> \
                <div class="three columns"><button data-url="/resolve_entry" \
                    data-id="' + message.id + '" class="resolve">Resolve</button></div> \
            </div>'
        );
    });

    socket.on('resolve_entry_response', function (message) {
        $('#queue-entry-' + message.id).remove();
        $('#resolved').append('\
            <div class="queue-entry row" id="resolved-entry-' + message.id + '"> \
                <div class="three columns">' + message.name + '</div> \
                <div class="three columns">' + message.add_date + '</div> \
                <div class="three columns">' + message.assignment + '</div> \
                <div class="three columns">' + message.question + '</div> \
            </div>'
        );
    });


});