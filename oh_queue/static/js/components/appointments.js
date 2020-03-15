function Appointments({ state }) {
    return (
        <div className="admin-root">
            <Navbar state={state} mode="appointments"/>
            <OfflineIndicator offline={state.offline && state.loaded}/>
            <FutureSlots state={state} />
        </div>
    );
}
