function ConfirmedAppointmentCard({ appointment, signup, locations, assignments, onClick })  {
    const startTimeObj = moment.utc(appointment.start_time);
    const endTimeObj = moment.utc(appointment.start_time).add(appointment.duration, "seconds");

    const assignmentName = signup.assignment_id && assignments[signup.assignment_id].name;
    const questionName = signup.question ? " Question " + signup.question : "";

    const questionBlock = assignmentName && <React.Fragment>have asked for help with <b>{assignmentName + questionName}</b>, and</React.Fragment>;
    const helperBlock = appointment.helper && <React.Fragment>by <b>{appointment.helper.name}</b>, </React.Fragment>;

    const content = (
        <React.Fragment>
            Your appointment is at <b>{locations[appointment.location_id].name}</b>.
            You {questionBlock} will be helped {helperBlock} in a group of <b>{Math.max(appointment.capacity, appointment.signups.length)}</b>.
        </React.Fragment>
    );

    const [modalOpen, setModalOpen] = React.useState(false);

    const handleClick = (e) => {
        e.preventDefault();
        if (onClick) {
            onClick()
        } else {
            setModalOpen(true);
        }
    };

    return (
        <React.Fragment>
            <div className="panel panel-default" onClick={handleClick}>
                <ul className="list-group">
                    <a href="#" className="list-group-item">
                        <h4 className="list-group-item-heading">
                            {startTimeObj.format("dddd, MMMM D")} at {startTimeObj.format("h:mma")}-{endTimeObj.format("h:mma")}
                        </h4>
                        {content}
                    </a>
                </ul>
            </div>
            <AppointmentOverlay
                assignments={assignments}
                appointment={appointment.id}
                signup={signup}
                isOpen={modalOpen}
                onSubmit={() => setModalOpen(false)}
            />
        </React.Fragment>
    )
}
