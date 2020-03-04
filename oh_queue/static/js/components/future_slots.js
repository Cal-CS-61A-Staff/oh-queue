function FutureSlots({ state }) {
    const { assignments, appointments, locations, currentUser } = state;
    const filteredAssignments = Object.values(assignments).filter(assignment => assignment.visible).sort((a, b) => a.name.localeCompare(b.name));

    const timeComparator = (a, b) => moment(a.start_time).isAfter(moment(b.start_time)) ? 1 : -1;
    const appointmentsList = Array.from(Object.values(appointments)).sort(timeComparator);

    const days = new Map();
    for (const appointment of appointmentsList) {
        const date = moment(appointment.start_time).format('LL');
        if (!days.has(date)) {
            days.set(date, []);
        }
        days.get(date).push(appointment)
    }

    for (const value of days.values()) {
        value.sort(timeComparator);
    }

    const [openedAssignment, setOpenedAssignment] = React.useState();

    const handleAddClick = (assignmentId) => {
        setOpenedAssignment(assignmentId);
        $("#appointment-overlay").modal();
    };

    const handleStudentSignup = (data) => {
        $("#appointment-overlay").modal("hide");
        app.makeRequest(
            'assign_appointment', {
                appointment_id: openedAssignment,
                assignment_id: parseInt(data.assignment),
                question: data.question,
                description: data.description,
            });
    };

    return (
        <React.Fragment>
            <div className="container">
                <br/>
                {currentUser && !currentUser.isStaff && <ConfirmedAppointment/>}
                {Array.from(days.entries()).map(([day, dayAppointments]) =>
                    <div>
                        <h3> {day} </h3>
                        <div className="card-holder">
                            {dayAppointments.map(appointment => {
                                    return (
                                        <AppointmentCard
                                            locations={locations}
                                            appointment={appointment}
                                            currentUser={currentUser}
                                            assignments={assignments}
                                            onStudentSignup={handleAddClick}
                                        />
                                    )
                                }
                            )}
                        </div>
                        <hr/>
                    </div>)
                }
            </div>
            <AppointmentOverlay assignments={filteredAssignments} onSubmit={handleStudentSignup} />
        </React.Fragment>
    );
}
