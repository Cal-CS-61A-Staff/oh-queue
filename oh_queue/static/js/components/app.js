class App extends React.Component {
  constructor(props) {
    super(props);
    this.state =  initialState;
  }

  setOffline(offline) {
    let state = this.state;
    state.offline = offline;
    this.setState(state);
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

  addMessage(message, category) {
    let state = this.state;
    addMessage(state, message, category);
    this.setState(state);
  }

  clearMessage(id) {
    let state = this.state;
    clearMessage(state, id);
    this.setState(state);
  }

  makeRequest(eventType, request, follow_redirect=false) {
    socket.emit(eventType, request, (response) => {
      if (response == null) {
        return;
      }
      let messages = response.messages || [];
      for (var message of messages) {
        this.addMessage(message.text, message.category);
      }
      if (follow_redirect && response.redirect) {
        ReactRouter.browserHistory.push(response.redirect);
      }
    });
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
          <ReactRouter.Route path="/:id/" component={TicketView}/>
        </ReactRouter.Route>
      </ReactRouter.Router>
    );
  }
}
