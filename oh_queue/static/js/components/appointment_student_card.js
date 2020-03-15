function AppointmentStudentCard({ status, signup, assignments, isStaff }) {
    const assignmentName = signup.assignment_id && assignments[signup.assignment_id].name;
    const questionName = signup.question ? " Question " + signup.question : "";

    const question = assignmentName ?
        <Slot>{assignmentName + questionName}</Slot> :
        <Slot className="slot-disabled"><i>No question specified</i></Slot>;

    const description = signup.description ?
        <Slot className="ticket-view-desc">{signup.description}</Slot> :
        <Slot className="slot-disabled"><i>No description provided</i></Slot>;

    const colorLookup = {
        unknown: "default",
        present: "primary",
        excused: "warning",
        absent: "danger",
    };

    const color = colorLookup[signup.attendance_status];

    return (
        <div className={`panel panel-${color}`}>
            <div className="panel-heading">
                <h3 className="panel-title">{
                    status === "pending" ? "Start Appointment to View Name" : signup.user.name
                }</h3>
            </div>
            <ul className="list-group">
                {question}
                {description}
            </ul>
            {isStaff && status === "active" && (
                <div className="panel-footer attendance-buttons">
                    <AttendanceButton color="primary" signup={signup} status="present" />
                    <AttendanceButton color="warning" signup={signup} status="excused" />
                    <AttendanceButton color="danger" signup={signup} status="absent" />
                </div>
            )}
        </div>
    )
}

function AttendanceButton({ signup, status, color }) {
    const handleClick = () => {
        app.makeRequest('mark_attendance', { signup_id: signup.id, status })
    };

    const active = signup.attendance_status === status;

    return (
        <button className={`btn btn-${color}`} onClick={handleClick} disabled={signup.status === "resolved" || active}>
            {status[0].toUpperCase() + status.slice(1).toLowerCase()}
        </button>
    )
}
