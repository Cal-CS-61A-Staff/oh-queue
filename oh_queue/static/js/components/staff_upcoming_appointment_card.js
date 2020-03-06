function StaffUpcomingAppointmentCard({ appointment, locations })  {
    const startTimeObj = moment.utc(appointment.start_time);
    const endTimeObj = moment.utc(appointment.start_time).add(appointment.duration, "seconds");

    const possessive = appointment.helper ? "Your" : "This";

    const content = (
        <React.Fragment>
            {possessive} appointment is at <b>{locations[appointment.location_id].name}</b>,
            with a group of <b>{appointment.signups.length}</b> students.
        </React.Fragment>
    );

    const history = ReactRouterDOM.useHistory();

    const handleClick = (e) => {
        e.preventDefault();
        history.push("/appointments/" + appointment.id);
    };

    const style = {};

    if (!appointment.helper) {
        style.borderLeft = "5px solid red";
    }

    if (appointment.status === "active") {
        style.borderLeft = "5px solid #337ab7";
    }

    return (
        <div className="panel panel-default" onClick={handleClick} style={style}>
            <ul className="list-group">
                <a href="#" className="list-group-item">
                    {!appointment.helper && <span className="badge badge-danger">No helper assigned!</span>}
                    {appointment.status === "active" && <span className="badge badge-primary">In Progress</span>}
                    <h4 className="list-group-item-heading">
                        {startTimeObj.format("dddd, MMMM D")} at {startTimeObj.format("h:mma")}‐{endTimeObj.format("h:mma")}
                    </h4>
                    {content}
                </a>
            </ul>
        </div>
    )

}
