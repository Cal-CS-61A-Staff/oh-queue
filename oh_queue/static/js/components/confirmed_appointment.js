function ConfirmedAppointment() {
    return (
        <div className="alert alert-success" role="alert">
            <h3 className="appointment-header">Appointment Scheduled</h3>
            <p>
                Your OH appointment is scheduled for <b>Cory 123</b> at <b>5pm</b> on <b>Friday, March 6</b>. You have asked for help with <b>Hog Question 5</b>, and will be helped by <b>Kavi Gupta</b>.
            </p>
            <p>
                You can edit your question and description using the below form. If you can't make your appointment, click the button to cancel.
            </p>
            <p>
                <button className="btn btn-danger">Cancel Appointment</button>
            </p>
        </div>
    )
}
