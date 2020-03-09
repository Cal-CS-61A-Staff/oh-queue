class AdminLayout extends React.Component {
  render() {
    let { Route, Switch } = ReactRouterDOM;
    var { location, match, state } = this.props;

    const { pathname } = location;

    return (
      <div className="admin-root">
        <Navbar state={state} mode="admin"/>
        <OfflineIndicator offline={state.offline && state.loaded}/>
        <br />
        <div className="container">
          <AdminTabs currentTab={pathname.split("/")[pathname.split("/").length - 1]}/>
          <Switch location={location}>
              <Route exact path={`${match.path}`}
                     render={(props) => (<AdminConfigManager state={state} {...props} />)}/>
              <Route path={`${match.path}/appointments`} render={(props) => (
                  <AdminAppointmentsManager state={state} {...props} />)}/>
              <Route path={`${match.path}/assignments`} render={(props) => (
                  <AdminAssignmentsManager state={state} {...props} />)}/>
              <Route path={`${match.path}/locations`}
                     render={(props) => (<AdminLocationsManager state={state} {...props} />)}/>
          </Switch>
        </div>
      </div>
    )
  }
}
