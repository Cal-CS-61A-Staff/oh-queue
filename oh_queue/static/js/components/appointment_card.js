const calcSpareCapacity = appointment => Math.max(0, appointment.capacity - appointment.signups.length);

function AppointmentCard({ currentUser, locations, appointment, assignments, onStudentSignup }) {
    let panelColor = "panel-default";
    let canAdd = true;

    const spareCapacity = calcSpareCapacity(appointment);

    if (currentUser.isStaff) {
        if (appointment.helper && appointment.helper.id === currentUser.id) {
            panelColor = "panel-primary";
        } else if (currentUser.isStaff && !appointment.helper) {
            panelColor = "panel-warning";
        }
    } else {
        if (appointment.signups.some(({ user }) => user && user.id === currentUser.id)) {
            panelColor = "panel-success";
            canAdd = false;
        } else if (spareCapacity === 0) {
            panelColor = "panel-danger";
        }
    }

    const panelClass = classNames({
        'panel': true,
        [panelColor]: true,
    });

    const handleStaffSignup = () => {
        app.makeRequest('assign_staff_appointment', appointment.id)
    };

    const handleStaffUnassign = () => {
        app.makeRequest('unassign_staff_appointment', appointment.id)
        // TODO: handle race conditions between students
    };

    const handleStudentSignup = (e, signup) => {
        e.preventDefault();
        onStudentSignup(appointment.id, signup);
    };

    return (
        <div className={panelClass}>
            <AppointmentCardHeader appointment={appointment} locations={locations}/>
            <ul className="list-group">
                <AppointmentCardHelperRow
                    appointment={appointment}
                    currentUser={currentUser}
                    onStaffSignup={handleStaffSignup}
                    onStaffUnassign={handleStaffUnassign}
                />
                <AppointmentCardStudentList
                    appointment={appointment}
                    currentUser={currentUser}
                    assignments={assignments}
                    onStudentSignup={handleStudentSignup}
                />
                <AppointmentCardPostList
                    appointment={appointment}
                    currentUser={currentUser}
                    canAdd={canAdd}
                    onStudentSignup={handleStudentSignup}
                />
            </ul>
        </div>
    )
}

function AppointmentCardHeader({ appointment, locations }) {
    const startTimeObj = moment.utc(appointment.start_time);
    const endTimeObj = moment.utc(appointment.start_time).add(appointment.duration, "seconds");

    const spareCapacity = calcSpareCapacity(appointment);

    return (
        <div className="panel-heading">
            <h3 className="panel-title">
                {startTimeObj.format("h:mma")}-{endTimeObj.format("h:mma")}
                {" in "}
                {locations[appointment.location_id].name}
                {" "}
                ({spareCapacity} slot{spareCapacity === 1 ? "" : "s"} left)</h3>
        </div>
    );
}

function AppointmentCardHelperRow({ appointment, currentUser, onStaffSignup, onStaffUnassign }) {
    return (
        <Slot>
            {appointment.helper ? `Helper assigned: ${appointment.helper.name}` : "No helper assigned yet."}
            {currentUser.isStaff &&
            (appointment.helper ?
                <button className="btn btn-danger btn-take-over btn-xs"
                        onClick={onStaffUnassign}>Unassign</button> :
                <button className="btn btn-success btn-take-over btn-xs"
                        onClick={onStaffSignup}>Sign up</button>)
            }
        </Slot>
    )
}

function AppointmentCardStudentList({ appointment, assignments, currentUser, onStudentSignup }) {
    return (
        appointment.signups.map(signup =>
            <Slot
                link={signup.user && (signup.user.id === currentUser.id || currentUser.isStaff)}
                badgeText={signup.assignment_id && assignments[signup.assignment_id].name}
                onClick={e => onStudentSignup(e, signup)}
            >
                {currentUser.isStaff ?
                    signup.user.name :
                    signup.user && currentUser.id === signup.user.id ?
                        "You (click to edit)" :
                        "Anonymous Student"
                }
            </Slot>
        )
    )
}

function AppointmentCardPostList({ appointment, currentUser, onStudentSignup, canAdd }) {
    const spareCapacity = calcSpareCapacity(appointment);
    return (
        <React.Fragment>
            {currentUser.isStaff && (
                <Slot link onClick={onStudentSignup}>
                    Add a student to the section
                </Slot>
            )}
            {!currentUser.isStaff && canAdd && spareCapacity > 0 && (
                <Slot link onClick={onStudentSignup}>
                    Add yourself to the section
                </Slot>
            )}
            {Array(Math.max(spareCapacity - (canAdd || currentUser.isStaff), 0)).fill().map(() => (
                <Slot className="slot-disabled">Extra Slot</Slot>
            ))}
        </React.Fragment>
    );
}
