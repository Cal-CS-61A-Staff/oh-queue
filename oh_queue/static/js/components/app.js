class App extends React.Component {
  constructor(props) {
    super(props);
    this.state =  initialState;
  }

  updateState(data) {
    let state = this.state;
    state.loaded = true;
    state.currentUser = data.currentUser;
    for (var ticket of data.tickets) {
      setTicket(state, ticket);
    }
    this.setState(state);
  }

  updateTicket(ticket) {
    let state = this.state;
    setTicket(state, ticket);
    this.setState(state);
  }

  render() {
    // Give route components (e.g. Queue, TicketView) the state
    let state = this.state;
    let createElement = (Component, props) =>
      <Component state={state} {...props}/>

    return (
      <ReactRouter.Router
        history={ReactRouter.browserHistory}
        createElement={createElement}>
        <ReactRouter.Route path="/" component={Base}>
          <ReactRouter.IndexRoute component={Queue}/>
          <ReactRouter.Route path="/:id" component={TicketView}/>
        </ReactRouter.Route>
      </ReactRouter.Router>
    );
  }
}
