$(document).ready(function(){
	// Variables
	var socket = io.connect('http://' + document.domain + ':' + location.port);

	socket.on('connect', function() {
        socket.emit('connect');
    });

    // Socket handler for adding entries
    socket.on('add_entry_response', function(message) {
        $('#queue').append('\
            <div class="queue-entry row" id="' + message.id + '"> \
                <div class="three columns">' + message.name + '</div> \
                <div class="three columns">' + message.add_date + '</div> \
                <div class="three columns">' + message.assignment + '</div> \
                <div class="three columns">' + message.question + '</div> \
            </div>'
        );
    });
});