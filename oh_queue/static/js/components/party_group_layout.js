const { Link } = ReactRouterDOM;

function PartyGroupLayout({ state, match, loadGroup, socket }) {
    const groupID = +match.params.id;
    if (!getGroup(state, groupID)) {
        loadGroup(groupID);
        return "loading...";
    }
    const group = getGroup(state, groupID);

    let actionButton = null;

    // if (isStaff(state)) {
    //     if (group.status === "resolved") {
            actionButton = (
                <Link to="/">
                    <AppointmentLayoutButton color="default" onClick={() => null}>
                        Return to Queue
                    </AppointmentLayoutButton>
                </Link>
            );
    //     } else if (!group.helper) {
    //         actionButton = (
    //             <AppointmentLayoutButton color="success" onClick={handleStaffSignup}>
    //                 Sign up to help section
    //             </AppointmentLayoutButton>
    //         );
    //     } else if (group.helper.id !== state.currentUser.id) {
    //         actionButton = (
    //             <div>
    //                 <AppointmentLayoutButton color="warning" onClick={handleStaffSignup}>
    //                     Reassign Appointment
    //                 </AppointmentLayoutButton>
    //                 <AppointmentLayoutButton color="danger" onClick={handleStaffUnassign}>
    //                     Unassign Appointment
    //                 </AppointmentLayoutButton>
    //             </div>
    //         );
    //     } else if (group.status === "pending") {
    //         actionButton = (
    //             <div>
    //                 <AppointmentLayoutButton color="primary" onClick={updateAppointment("active")}>
    //                     Start Appointment
    //                 </AppointmentLayoutButton>
    //                 <AppointmentLayoutButton color="danger" onClick={handleStaffUnassign}>
    //                     Unassign Appointment
    //                 </AppointmentLayoutButton>
    //             </div>
    //         );
    //     } else if (attendanceDone) {
    //         actionButton = (
    //             <div>
    //                 <AppointmentLayoutButton color="danger" onClick={updateAppointment("resolved")}>
    //                     End Appointment
    //                 </AppointmentLayoutButton>
    //                 <AppointmentLayoutButton color="default" onClick={updateAppointment("pending")}>
    //                     Requeue Appointment
    //                 </AppointmentLayoutButton>
    //             </div>
    //         );
    //     } else {
    //         actionButton = (
    //             <div>
    //             <span
    //                 className="d-inline-block btn-block"
    //                 tabIndex="0" data-toggle="tooltip" data-placement="top"
    //                 title="You must record attendance before ending appointments.">
    //                 <button className="btn btn-danger btn-lg btn-block" disabled
    //                         style={{ pointerEvents: 'none' }}>
    //                     End Appointment
    //                 </button>
    //             </span>
    //                 <AppointmentLayoutButton color="default" onClick={updateAppointment("pending")}>
    //                     Requeue Appointment
    //                 </AppointmentLayoutButton>
    //             </div>
    //         );
    //     }
    // }

    let onlineButtons = null;
    if (state.locations[group.location_id].name === "Online" && group.status === "active") {

        const callButton = group.helper.call_url && (
            <AppointmentLayoutButton color="success" onClick={() => window.open(group.helper.call_url, "_blank")}>
                Join Call
            </AppointmentLayoutButton>
        );
        const docButton = group.helper.doc_url && (
            <AppointmentLayoutButton color="info" onClick={() => window.open(group.helper.doc_url, "_blank")}>
                Open Shared Document
            </AppointmentLayoutButton>
        );
        if (callButton || docButton) {
            onlineButtons = (
                <React.Fragment>
                    {callButton}
                    {docButton}
                    {actionButton && <hr />}
                </React.Fragment>
            )
        }
    }

    return (
        <div>
            <Navbar state={state} mode="party"/>
            <div className="container">
                <br/>
                <h2 className="list-group-item-heading text-center">
                    {state.assignments[group.assignment_id].name}
                    {" "}
                    {group.question}
                    <small className="clearfix">
                        {group.group_status[0].toUpperCase() + group.group_status.slice(1)}
                        {" "}
                        &middot;
                        {" "}
                        {state.locations[group.location_id].name}
                    </small>
                    <p className="ticket-view-text text-center"> Created 2 hours ago </p>
                    <hr/>
                    {(onlineButtons || actionButton) && (
                        <div className="row">
                            <div className="col-xs-12 col-md-6 col-md-offset-3">
                                <div className="well">
                                    {onlineButtons}
                                    {actionButton}
                                </div>
                            </div>
                        </div>
                    )}
                </h2>

                <Messages messages={state.messages}/>

                {state.locations[group.location_id].name === "Online" && (
                    <ChatBox
                        key={group.id}
                        currentUser={state.currentUser}
                        socket={socket}
                        id={group.id}
                        mode="group"
                    />
                )}

                {state.config.ticket_prompt &&
                <div className="row">
                    <div className="col-xs-12 col-md-6 col-md-offset-3 text-center">
                        <hr/>
                        <ReactMarkdown source={state.config.ticket_prompt}/>
                    </div>
                </div>
                }
            </div>
        </div>
    )
}

function AppointmentLayoutButton({ color, children, onClick }) {
    return (
        <button className={`btn btn-${color} btn-lg btn-block`}
                onClick={onClick}>
            {children}
        </button>
    );
}
