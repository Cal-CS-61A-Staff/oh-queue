function AppointmentLayout({ state, match, loadAppointment }) {
    const appointmentID = +match.params.id;
    if (!getAppointment(state, appointmentID)) {
        loadAppointment(appointmentID);
        return "loading...";
    }
    const appointment = getAppointment(state, appointmentID);
    return appointment.helper.name;
}
