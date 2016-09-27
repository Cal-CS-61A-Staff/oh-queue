let Base = ({state, children}) => {
  let myTicket = getMyTicket(state);

  if ((state.currentUser && state.currentUser.isStaff) || myTicket) {
    requestNotificationPermission();
  }

  if (!state.loaded) return null;

  return (
    <div>
      <Navbar currentUser={state.currentUser} myTicket={myTicket}/>
      {children}
    </div>
  );
};
