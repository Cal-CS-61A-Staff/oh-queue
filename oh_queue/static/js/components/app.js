class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = initialState;

    let socket = connectSocket();
    this.socket = socket;
    socket.on('connect', () => app.setOffline(false));
    socket.on('disconnect', () => app.setOffline(true));
    socket.on('state', (data) => app.updateState(data));
    socket.on('event', (data) => app.updateTicket(data.ticket));
  }

  refresh() {
    this.setState(this.state);
  }

  setOffline(offline) {
    this.state.offline = offline;
    this.refresh();
  }

  updateState(data) {
    this.state.loaded = true;
    this.state.currentUser = data.currentUser;
    for (var ticket of data.tickets) {
      setTicket(this.state, ticket);
    }
    this.refresh();
  }

  updateTicket(ticket) {
    setTicket(this.state, ticket);
    this.refresh();
  }

  loadTicket(id) {
    loadTicket(this.state, id);
    this.refresh();
    this.socket.emit('load_ticket', id, (ticket) => {
      receiveTicket(this.state, id, ticket);
      this.refresh();
    });
  }

  addMessage(message, category) {
    addMessage(this.state, message, category);
    this.refresh();
  }

  clearMessage(id) {
    clearMessage(this.state, id);
    this.refresh();
  }

  makeRequest(eventType, request, follow_redirect=false) {
    this.socket.emit(eventType, request, (response) => {
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
