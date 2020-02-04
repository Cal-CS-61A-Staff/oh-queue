let Home = ({match, state, children}) => {
  let { Route, Switch } = ReactRouterDOM;

  if (isStaff(state) || getMyTicket(state)) {
    requestNotificationPermission();
  }

  // TODO loading indicator instead of blank screen
  if (!state.loaded) return null;

  return (
    <div>
      <Navbar state={state} />
      <OfflineIndicator offline={state.offline && state.loaded}/>
      <Queue state={state} />
    </div>
  );
};
