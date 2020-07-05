function GroupCard({ group, state }: {group: Group, state: State}) {
    let panelColor = "panel-default";

    if (isStaff(state)) {
        panelColor = "panel-danger";
    } else {
        panelColor = "panel-success";
    }

    const panelClass = classNames({
        'panel': true,
        [panelColor]: true,
    });

    const ownerName = group.attendees[0].user.shortName;

    const joinText = group.attendees.length === 1 ? `Join ${ownerName}!` : `Join ${ownerName} and ${group.attendees.length - 1} others!`;

    const joinGroup = () => {
        app.makeRequest("join_group", group.id, true);
    };

    return (
        <div className={panelClass}>
            <div className="panel-heading">
                {state.assignments[group.assignment_id].name}
                {" "}
                {ticketQuestion(state, group)}
                {" "}
                &middot;
                {" "}
                {state.locations[group.location_id].name}
            </div>
            <div className="panel-body">
                {group.attendees.length === 1 ? <p>{ownerName} is looking for a group!</p> : null}
                <blockquote>
                    {group.description}
                </blockquote>
                <p>
                    Created 2 hours ago.
                </p>
                <button className="btn btn-default" type="button" onClick={joinGroup}>{joinText}</button>
            </div>
        </div>
    )
}
