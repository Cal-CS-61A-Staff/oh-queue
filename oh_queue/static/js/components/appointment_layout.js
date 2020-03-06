const { Link } = ReactRouterDOM;

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
            <Link to="/">
                <AppointmentLayoutButton color="default" onClick={() => null}>
                    Return to Queue
                </AppointmentLayoutButton>
            </Link>
        );
    } else if (!appointment.helper) {
        actionButton = (
            <AppointmentLayoutButton color="success" onClick={handleStaffSignup}>
                Sign up to help section
            </AppointmentLayoutButton>
        );
    } else if (appointment.helper.id !== state.currentUser.id) {
        actionButton = (
            <div>
                <AppointmentLayoutButton color="warning" onClick={handleStaffSignup}>
                    Reassign Appointment
                </AppointmentLayoutButton>
                <AppointmentLayoutButton color="danger" onClick={handleStaffUnassign}>
                    Unassign Appointment
                </AppointmentLayoutButton>
            </div>
        );
    } else if (appointment.status === "pending") {
        actionButton = (
            <div>
                <AppointmentLayoutButton color="primary" onClick={updateAppointment("active")}>
                    Start Appointment
                </AppointmentLayoutButton>
                <AppointmentLayoutButton color="danger" onClick={handleStaffUnassign}>
                    Unassign Appointment
                </AppointmentLayoutButton>
            </div>
        );
    } else if (attendanceDone) {
        actionButton = (
            <div>
                <AppointmentLayoutButton color="danger" onClick={updateAppointment("resolved")}>
                    End Appointment
                </AppointmentLayoutButton>
                <AppointmentLayoutButton color="default" onClick={updateAppointment("pending")}>
                    Requeue Appointment
                </AppointmentLayoutButton>
            </div>
        );
    } else {
        actionButton = (
            <div>
                <span
                    className="d-inline-block btn-block"
                    tabIndex="0" data-toggle="tooltip" data-placement="top"
                    title="You must record attendance before ending appointments.">
                    <button className="btn btn-danger btn-lg btn-block" disabled
                            style={{ pointerEvents: 'none' }}>
                        End Appointment
                    </button>
                </span>
                <AppointmentLayoutButton color="default" onClick={updateAppointment("pending")}>
                    Requeue Appointment
                </AppointmentLayoutButton>
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
                    <p className="ticket-view-text text-center"> {appointment.status[0].toUpperCase() + appointment.status.slice(1)} </p>
                    <hr/>
                    {state.currentUser.isStaff && (
                        <div className="row">
                            <div className="col-xs-12 col-md-6 col-md-offset-3">
                                <div className="well">
                                    {actionButton}
                                </div>
                            </div>
                        </div>
                    )}
                </h2>
                {state.currentUser.isStaff && !attendanceDone &&
                <div className="alert alert-danger" role="alert">
                    Remember to record attendance!
                </div>}

                <Messages messages={state.messages}/>

                <div className="card-holder">
                    {appointment.signups.map(signup => (
                        <AppointmentStudentCard
                            isStaff={state.currentUser.isStaff}
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

function AppointmentLayoutButton({ color, children, onClick }) {
    return (
        <button className={`btn btn-${color} btn-lg btn-block`}
                onClick={onClick}>
            {children}
        </button>
    );
}
