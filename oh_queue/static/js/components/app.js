/* This component holds the global application state, and manages the websocket
 * connection. To update the state, call a method on the global "app" object,
 * e.g. as
 *
 *     app.addMessage("Something bad happened", "danger");
 *
 * Because it sits at the root of React heirarchy, any state changes in the app
 * will cause the entire app to re-render, so any state changes are reflected
 * instantly.
 *
 * All other React components are "stateless". Many of them are simply pure
 * functions that take the state and produce HTML. A few are slightly more
 * complicated in that they have to interact with jQuery or the network.
 *
 * NB: calling app methods inside a render() method will result in an infinite
 * loop.
 */
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = initialState;

    let socket = connectSocket();
    this.socket = socket;
    socket.on('connect', () => {
      app.setOffline(false);
      app.refreshTickets();
    });
    socket.on('disconnect', () => app.setOffline(true));
    socket.on('state', (data) => app.updateState(data));
    socket.on('event', (data) => app.updateTicket(data));
    socket.on('presence', (data) => app.updatePresence(data));
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

  updatePresence(data) {
    this.state.presence = data;
    this.refresh();
  }

  refreshTickets() {
    let ticketIDs = Array.from(this.state.tickets.keys());
    this.socket.emit('refresh', ticketIDs, (data) => {
      for (var ticket of data.tickets) {
        setTicket(this.state, ticket);
      }
      this.refresh();
    });
  }

  shouldNotify(ticket, type) {
    return (isStaff(this.state) && type === 'create');
  }

  updateTicket(data) {
    if (this.shouldNotify(data.ticket, data.type)) {
        notifyUser("New Request for " + data.ticket.assignment,
                   data.ticket.location);
    }
    setTicket(this.state, data.ticket);
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

  toggleFilter() {
    this.state.filter.enabled = !this.state.filter.enabled;
    this.refresh();
  }

  setFilter(filter) {
    this.state.filter = filter;
    this.refresh();
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
          <ReactRouter.Route path="/error" component={ErrorView}/>
          <ReactRouter.Route path="/:id/" component={TicketView}/>
        </ReactRouter.Route>
        <ReactRouter.Route path="/presence" component={PresenceIndicator}/>
      </ReactRouter.Router>
    );
  }
}
