$(document).ready(function(){
	// Variables
	var socket = io.connect('http://' + document.domain + ':' + location.port);

	socket.on('connect', function() {
        socket.emit('connect');
    });

    function scrollBottom() {
        $('html, body').animate({
            scrollTop: $(document).height()
        }, 600);
    }

    function toggleHelpForm() {
        $("#help-form-container").slideToggle('medium');
        $('#add-entry').slideToggle('medium');
    }

    // Socket handler for adding entries
    socket.on('add_entry_response', function(message) {
        $('#queue').append('\
            <div class="queue-entry row" id="queue-entry-' + message.id + '"> \
                <div class="three columns no-hide">' + message.name + '</div> \
                <div class="three columns">' + message.add_date + '</div> \
                <div class="three columns">' + message.assignment + '</div> \
                <div class="three columns">' + message.question + '</div> \
            </div>'
        );

        $('#' + message.id).slideToggle('medium');
    });

    socket.on('resolve_entry_response', function (message) {
        console.log(message.id);
        $('#queue-entry-' + message.id).remove();
    });

    // Help form listeners
    $('#add-entry').click(function() {
        toggleHelpForm();
        scrollBottom();
    });

    $('#cancel-form').click(function() {
        toggleHelpForm();
    })

    $('#help-form').submit(function(event) {
        NProgress.start();
        event.preventDefault();

        var request = $.post('/add_entry', {
            name: $('#name').val(), 
            sid: $('#sid').val(), 
            session_password: 'foo', 
            assignment: $('#assignment').val(),
            question: $('#question').val()
        });

        request.done(function(msg) {
            toggleHelpForm();
            NProgress.done();
            if (msg.result === 'failure') {
                alert("Your help request could not be added. Possible reason: " + msg.error);
            }
        })
        .fail(function (msg) {
            toggleHelpForm();
            NProgress.done();
            // Currently, the alert doesn't work and no messages are displayed
            alert("Your help request could not be added. Possible reason: Incomplete fields");
        });
    });
});
