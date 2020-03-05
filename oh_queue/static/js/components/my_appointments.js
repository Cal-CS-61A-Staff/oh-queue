function MyAppointments({ state }) {
    const history = ReactRouterDOM.useHistory();

    const redirect = (id) => {
        history.push("/appointments/" + id);
    };

    const studentContent = getMySignups(state)
        .filter(({ appointment }) => isSoon(appointment.start_time))
        .map(({ appointment, signup }) => {
            const handleClick = appointment.status !== "pending" && (() => redirect(appointment.id));
            return (
                <ConfirmedAppointmentCard
                    assignments={state.assignments}
                    locations={state.locations}
                    appointment={appointment}
                    signup={signup}
                    onClick={handleClick}
                />
            )
        });

    const staffContent = getMyAppointmentsStaff(state)
        .filter(appointment => isSoon(appointment.start_time))
        .sort((x, y) => (+!!y.helper - +!!x.helper) * 2 + appointmentTimeComparator(x, y))
        .map(appointment => {
            return (
                <StaffUpcomingAppointmentCard
                    appointment={appointment}
                    locations={state.locations}
                    onClick={() => redirect(appointment.id)}
                />
            )
        });

    const content = state.currentUser && state.currentUser.isStaff ? staffContent : studentContent;

    return content.length > 0 && (
        <div>
            <div className="assigned-tickets-header">
                Upcoming Appointments
            </div>
            {content}
        </div>
    )
}
