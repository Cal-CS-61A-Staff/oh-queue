class AdminLayout extends React.Component {
  render() {
    let { BrowserRouter, Route, Switch } = ReactRouterDOM;
    var { location, match, state } = this.props;

    return (
      <div className="admin-root">
        <AdminNavbar state={state} />
        <OfflineIndicator offline={state.offline && state.loaded}/>
        <Switch location={location}>
          <Route exact path={`${match.path}`} render={(props) => (<AdminConfigManager state={state} {...props} />)} />
          <Route path={`${match.path}/assignments`} render={(props) => (<AdminAssignmentsManager state={state} {...props} />)} />
          <Route path={`${match.path}/locations`} render={(props) => (<AdminLocationsManager state={state} {...props} />)} />
        </Switch>
      </div>
    )
  }
}
