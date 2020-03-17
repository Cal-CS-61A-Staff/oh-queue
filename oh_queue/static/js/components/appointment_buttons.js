function AppointmentButtons() {
    const action = action => () => {
        app.makeRequest("bulk_appointment_action", action);
    };

    const { Link } = ReactRouterDOM;

    return (
        <div className="appointment-buttons">
            <Link className="btn btn-success" to="/admin/appointments">
                Add Appointments
            </Link>
            <button className="btn btn-warning" onClick={action("open_all_assigned")}>
                Open all assigned appointments
            </button>
            <button className="btn btn-primary" onClick={action("resolve_all_past")}>
                Resolve all past appointments
            </button>
            <button className="btn btn-danger" onClick={action("remove_all_unassigned")}>
                Remove all unassigned appointments
            </button>
        </div>
    );
}
