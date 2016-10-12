let Base = ({state, children}) => {
  let myTicket = getMyTicket(state);

  if (isHelper(state) || myTicket) {
    requestNotificationPermission();
  }

  // TODO loading indicator instead of blank screen
  if (!state.loaded) return null;

  return (
    <div>
      <Navbar currentUser={state.currentUser} myTicket={myTicket}/>
      <OfflineIndicator offline={state.offline && state.loaded}/>
      {children}
    </div>
  );
};
