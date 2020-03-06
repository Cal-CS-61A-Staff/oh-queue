function FutureSlots({ state }) {
    const { assignments, appointments, locations, currentUser, messages } = state;
    const filteredAssignments = Object.values(assignments).filter(assignment => assignment.visible).sort((a, b) => a.name.localeCompare(b.name));

    const activeAppointments = appointments.filter(({ status }) => status === "pending");

    const days = new Map();
    for (const appointment of activeAppointments) {
        const date = moment(appointment.start_time).format('dddd, MMMM D');
        if (!days.has(date)) {
            days.set(date, []);
        }
        days.get(date).push(appointment)
    }

    for (const value of days.values()) {
        value.sort(appointmentTimeComparator);
    }

    const [openedAppointment, setOpenedAppointment] = React.useState();
    const [openedSignup, setOpenedSignup] = React.useState();

    const [modalOpen, setModalOpen] = React.useState(false);

    const handleAddClick = (appointmentID, signup) => {
        setOpenedAppointment(appointmentID);
        setOpenedSignup(signup);
        setModalOpen(true);
    };

    const handleSubmit = () => {
        setModalOpen(false);
    };

    const mySignups = [];
    for (const appointment of activeAppointments) {
        for (const signup of appointment.signups) {
            if (signup.user && signup.user.id === currentUser.id) {
                mySignups.push({ appointment, signup });
            }
        }
    }

    return (
        <React.Fragment>
            {currentUser && !currentUser.isStaff && (
                <ConfirmedAppointment
                    mySignups={mySignups}
                    locations={locations}
                    assignments={assignments}
                />
            )}
            {(!currentUser || currentUser.isStaff) && <br />}
            <div className="container">
                <Messages messages={messages}/>
                <FilterControls state={state} />
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
            <AppointmentOverlay
                assignments={filteredAssignments}
                appointment={openedAppointment}
                signup={openedSignup}
                staffMode={currentUser && currentUser.isStaff}
                isOpen={modalOpen}
                onSubmit={handleSubmit}
            />
        </React.Fragment>
    );
}
