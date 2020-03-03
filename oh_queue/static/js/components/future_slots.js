function FutureSlots({ state }) {
    const { assignments } = state;
    const filteredAssignments = Object.values(assignments).filter(assignment => assignment.visible).sort((a, b) => a.name.localeCompare(b.name));
    return (
        <div className="container">
            <br/>
                <ConfirmedAppointment />
                <SlotsForm assignments={filteredAssignments} />
                <h3> Wednesday, March 4 </h3>
                <div className="card-holder">
                    <AppointmentCard />
                    <AppointmentCard />
                    <AppointmentCard />
                    <AppointmentCard />
                    <AppointmentCard />
                </div>
                <h3> Thursday, March 5 </h3>
                <div className="card-holder">
                    <AppointmentCard />
                    <AppointmentCard />
                    <AppointmentCard />
                    <AppointmentCard />
                    <AppointmentCard />
                    <AppointmentCard />
                </div>
        </div>
    );
}
