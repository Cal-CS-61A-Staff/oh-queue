let Base = ({state, children}) => {
  let myTicket = getMyTicket(state);

  if (isStaff(state) || myTicket) {
    requestNotificationPermission();
  }

  // TODO better loading indicator (less jarring)
  if (!state.loaded) return (
    <div className="spinner">
      <div className="dot1"></div>
      <div className="dot2"></div>
    </div>
  )

  return (
    <div>
      <Navbar currentUser={state.currentUser} myTicket={myTicket}/>
      <OfflineIndicator offline={state.offline && state.loaded}/>
      {children}
    </div>
  );
};
