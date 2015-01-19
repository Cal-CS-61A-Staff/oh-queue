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
                <div class="three columns">' + message.login + '</div> \
                <div class="three columns">' + message.add_date + '</div> \
                <div class="three columns">' + message.assignment + '</div> \
                <div class="three columns">' + message.question + '</div> \
            </div>'
        );
    });

    // Help form listeners
    $('#add-entry').click(function() {
        $('#help-form-container').show();
    });

    $('#help-form').submit(function(event) {
        NProgress.start();
        event.preventDefault();

        var request = $.post('/add_entry', {
            name: $('#name').val(), 
            login: $('#login').val(), 
            assignment: $('#assignment').val(), 
            question: $('#question').val()
        });

        request.done(function(msg) {
            $('#queue').animate({
                scrollTop: $('#queue')[0].scrollHeight
            }, 600);

            $('#help-form-container').hide();
            NProgress.done();
        });
    });

    // Close form if focus is lost
    $(document).mouseup(function(e) {
        var container = $("#help-form-container");

        if (!container.is(e.target) && container.has(e.target).length === 0) {
            container.hide();
        }
    });

    $(document).on('keydown', function(e) {
        if ( e.keyCode === 27 ) {
            $('#help-form-container').hide();
        }
    });
});