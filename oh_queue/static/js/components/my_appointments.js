function MyAppointments({ state }) {
    const appointment = Array.from(Object.values(state.appointments))[0];
    const signup = appointment.signups[0];

    const history = ReactRouterDOM.useHistory();

    const handleClick = () => {
        history.push("/appointments");
    };

    return (
        <div>
            <div className="assigned-tickets-header">
                Upcoming Appointments
            </div>
            <ConfirmedAppointmentCard
                assignments={state.assignments}
                locations={state.locations}
                appointment={appointment}
                signup={signup}
                onClick={handleClick}
            />
        </div>
    )
}
