$(document).ready(function(){
    // Variables
    var socket = io.connect('http://' + document.domain + ':' + location.port);

    // Helper Function
    function scrollBottom() {
        $('html, body').animate({
            scrollTop: $(document).height()
        }, 600);
    }

    function toggleHelpForm() {
        $('#help-form-container').slideToggle('medium');
        $('#add-entry').slideToggle('medium');
    }

    // Add event listeners
    $('#add-entry').click(function() {
        toggleHelpForm();
        scrollBottom();
    });

    $('#cancel-form').click(function() {
        toggleHelpForm();
    })

    var student_sid = null;

    $('#help-form').submit(function(event) {
        NProgress.start();
        event.preventDefault();

        var request = $.post('/add_entry', {
            name: $('#name').val(),
            sid: $('#sid').val(),
            location: $('#location').val(),
            assignment_type: $('#assignment_type').val(),
            assignment: $('#assignment').val(),
            question: $('#question').val()
        });

        request.done(function(msg) {
            toggleHelpForm();
            // Get permissions to notify users
            requestNotificationPermission();
            student_sid = $('#sid').val();
            NProgress.done();
            if (msg.result === 'failure') {
                alert('Your help request could not be added. Possible reason: ' + msg.error);
            }
        })
        .fail(function (msg) {
            toggleHelpForm();
            NProgress.done();
            // Currently, the alert doesn't work and no messages are displayed
            alert('Your help request could not be added.');
        });
    });

    socket.on('add_entry_response', function(message) {
        $('#queue').append('\
            <div class="row queue-entry" id="queue-entry-' + message.id + '"> \
                <div class="three columns no-hide">' + message.name + '</div> \
                <div class="three columns">' + message.add_date+ '</div> \
                <div class="three columns">' + message.location+ '</div> \
                <div class="three columns">' + message.assignment_type + '</div> \
                <div class="three columns">' + message.assignment + '</div> \
                <div class="three columns">' + message.question + '</div> \
            </div>'
        );

        $('#' + message.id).slideToggle('medium');
    });

    socket.on('resolve_entry_response', function (message) {
        if (student_sid != null && message.sid == student_sid) {
            notifyUser("61A Queue: Your name has been called", {});
        }
        $('#queue-entry-' + message.id).remove();
    });
});
