class AdminLayout extends React.Component {
  render() {
    let { BrowserRouter, Route, Switch } = ReactRouterDOM;
    let { CSSTransition, TransitionGroup } = ReactTransitionGroup;
    var { location, match, state } = this.props;

    return (
      <div className="admin-root">
        <AdminNavbar state={state} />
        <OfflineIndicator offline={state.offline && state.loaded}/>
        <TransitionGroup className="route-transition-group">
          <CSSTransition key={location.key} classNames="fade-in" timeout={{ enter: 250 * 2, exit: 250 }} appear={true}>
            <Switch location={location}>
              <Route exact path={match.path} render={(props) => (<AdminHome state={state} {...props} />)} />
              <Route path={`${match.path}/config`} render={(props) => (<AdminConfigManager state={state} {...props} />)} />
              <Route path={`${match.path}/assignments`} render={(props) => (<AdminAssignmentsManager state={state} {...props} />)} />
              <Route path={`${match.path}/locations`} render={(props) => (<AdminLocationsManager state={state} {...props} />)} />
            </Switch>
          </CSSTransition>
        </TransitionGroup>
      </div>
    )
  }
}
