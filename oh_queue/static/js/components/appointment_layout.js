function AppointmentLayout({ state, match, loadAppointment }) {
    const appointmentID = +match.params.id;
    if (!getAppointment(state, appointmentID)) {
        loadAppointment(appointmentID);
        return "loading...";
    }
    const appointment = getAppointment(state, appointmentID);

    const startTimeObj = moment.utc(appointment.start_time);
    const endTimeObj = moment.utc(appointment.start_time).add(appointment.duration, "seconds");

    const title = appointment.helper ?
        `${appointment.helper.shortName}'s Section` : "Unassigned Section";

    $(function () {
        $('[data-toggle="tooltip"]').tooltip()
    });

    const handleStaffSignup = () => {
        app.makeRequest('assign_staff_appointment', appointment.id)
    };

    const handleStaffUnassign = () => {
        app.makeRequest('unassign_staff_appointment', appointment.id)
    };

    const updateAppointment = (status) => () => {
        app.makeRequest('set_appointment_status', {
            appointment: appointment.id,
            status,
        })
    };

    const attendanceDone = appointment.signups.every(({ attendance_status }) => attendance_status !== "unknown");

    let actionButton;

    if (appointment.status === "resolved") {
        actionButton = (
            <button className="btn btn-default appointment-btn" onClick={handleStaffSignup}>
                Return to queue
            </button>
        );
    } else if (!appointment.helper) {
        actionButton = (
            <button className="btn btn-success appointment-btn" onClick={handleStaffSignup}>
                Sign up to help section
            </button>
        );
    } else if (appointment.helper.id !== state.currentUser.id) {
        actionButton = (
            <div>
                <button className="btn btn-warning appointment-btn" onClick={handleStaffSignup}>
                    Reassign Appointment
                </button>
                <button className="btn btn-danger appointment-btn" onClick={handleStaffUnassign}>
                    Unassign Appointment
                </button>
            </div>
        );
    } else if (appointment.status === "pending") {
        actionButton = (
            <div>
                <button className="btn btn-primary appointment-btn" onClick={updateAppointment("active")}>
                    Start Appointment
                </button>
                <button className="btn btn-danger appointment-btn" onClick={handleStaffUnassign}>
                    Unassign Appointment
                </button>
            </div>
        );
    } else if (attendanceDone) {
        actionButton = (
            <div>
                <button className="btn btn-danger appointment-btn" onClick={updateAppointment("resolved")}>
                    End Appointment
                </button>
                <button className="btn appointment-btn" onClick={updateAppointment("pending")}>
                    Requeue Appointment
                </button>
            </div>
        );
    } else {
        actionButton = (
            <div>
                <span
                    className="d-inline-block appointment-btn"
                    tabIndex="0" data-toggle="tooltip" data-placement="bottom"
                    title="You must record attendance before ending appointments.">
                    <button className="btn btn-danger" disabled
                            style={{ pointerEvents: 'none' }}>
                        End Appointment
                    </button>
                </span>
                <button className="btn btn-default appointment-btn" onClick={updateAppointment("pending")}>
                    Requeue Appointment
                </button>
            </div>
        );
    }

    return (
        <div>
            <Navbar state={state} mode="appointments"/>
            <div className="container">
                <br/>
                <h2 className="list-group-item-heading text-center">
                    {title}
                    <small className="clearfix">
                        {startTimeObj.format("h:mma")}‐{endTimeObj.format("h:mma")}
                        {" "}
                        &middot;
                        {" "}
                        {state.locations[appointment.location_id].name}
                    </small>
                    {actionButton}
                </h2>
                {!attendanceDone && <div className="alert alert-danger" role="alert">
                    Remember to record attendance!
                </div>}

                <Messages messages={state.messages}/>

                <div className="card-holder">
                    {appointment.signups.map(signup => (
                        <AppointmentStudentCard
                            status={appointment.status}
                            signup={signup}
                            assignments={state.assignments}
                        />
                    ))}
                </div>
                {state.config.ticket_prompt &&
                <div className="row">
                    <div className="col-xs-12 col-md-6 col-md-offset-3 text-center">
                        <hr/>
                        <ReactMarkdown source={state.config.ticket_prompt}/>
                    </div>
                </div>
                }
            </div>
        </div>
    )
}
