let Party = ({ match, state, children }) => {
    let { Route, Switch } = ReactRouterDOM;

    if (isStaff(state) || getMyTicket(state)) {
        requestNotificationPermission();
    }

    if (!state.loaded) return null;

    const showJumbotron = !isStaff(state);

    let containerClass = classNames({
        'container': true,
        'stub-jumbotron': !showJumbotron,
    });

    return (
        <div>
            <Navbar state={state} mode="party"/>
            <OfflineIndicator offline={state.offline && state.loaded}/>
            <div>
                {showJumbotron && <Jumbotron state={state}/>}
                <div className={containerClass}>
                    {!showJumbotron && <Messages messages={state.messages}/>}
                    <PresenceIndicator state={state} hideWaitTime />
                    {state.groups.toString()}

                </div>
            </div>
        </div>
    );
};
