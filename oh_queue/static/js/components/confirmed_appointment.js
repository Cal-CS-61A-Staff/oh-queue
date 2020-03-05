function ConfirmedAppointment() {
    return (
        <div className="jumbotron">
            <div className="container">
                <h2> Your Appointments </h2>
                <p>Click the card to edit your question or cancel your appointment. </p>
                <div className="confirmed-appointment-container">
                    <div className="panel panel-default">
                        <ul className="list-group">
                            <a href="#" className="list-group-item">
                                <h4 className="list-group-item-heading">
                                    Friday, March 6 at 5:30pm-6:30pm
                                </h4>
                                Your appointment is at <b>Cory 123</b>. You have asked for help with <b>Hog Question 5</b>, and will be
                                helped by <b>Kavi Gupta</b>, in a group of <b>6</b>.
                            </a>
                        </ul>
                    </div>
                    <div className="panel panel-default">
                        <ul className="list-group">
                            <a href="#" className="list-group-item">
                                <h4 className="list-group-item-heading">
                                    Friday, March 13 at 5:30pm-6:30pm
                                </h4>
                                Your appointment is at <b>Cory 123</b>. You have asked for help with <b>Hog Question 5</b>, and will be
                                helped by <b>Kavi Gupta</b>, in a group of <b>6</b>.
                            </a>
                        </ul>
                    </div>
                    <div className="panel panel-default">
                        <ul className="list-group">
                            <a href="#" className="list-group-item">
                                <h4 className="list-group-item-heading">
                                    Friday, March 20 at 5:30pm-6:30pm
                                </h4>
                                Your appointment is at <b>Cory 123</b>. You have asked for help with <b>Hog Question 5</b>, and will be
                                helped by <b>Kavi Gupta</b>, in a group of <b>6</b>.
                            </a>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}
