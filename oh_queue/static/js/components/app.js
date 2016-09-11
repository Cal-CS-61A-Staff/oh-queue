/* React Components */
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeTickets: [],
      myTicket: null,
    };

    var socket = connectSocket();

    socket.on('state', (state) => {
      const activeTickets = [];
      state.tickets.forEach((ticket) => { activeTickets.push([ticket.id, ticket]); });
      this.setState({ 
        activeTickets: activeTickets,
        isAuthenticated: state.isAuthenticated,
        currentUser: state.currentUser
      });
    });

    socket.on('event', (event) => {
      console.log(event.name);
      const ticket = event.ticket;
      const activeTickets = this.state.activeTickets.set(ticket.id, ticket);
      this.setState({
        activeTickets,
      })
    })
  }

  render() {

    const items = this.state.activeTickets.sort((a, b) => a[1].created > b[1].created)
                                          .map((ticket) => <Ticket key={ticket[0]} ticket={ticket[1]} />);
    const myTicket = this.state.myTicket ? <Ticket key={this.state.myTicket.id} ticket={this.state.myTicket} /> : null;

    return (
      <div>
        <nav className="navbar navbar-default navbar-fixed-top">
          <div className="container">
            <div className="navbar-header">
              <button type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar-collapse-section">
                <span className="icon-bar"></span>
                <span className="icon-bar"></span>
                <span className="icon-bar"></span>
              </button>
              <a className="navbar-brand" href="/"><strong>CS 61A</strong> Queue</a>
            </div>
            <div className="collapse navbar-collapse" id="navbar-collapse-section">
              <ul className="nav navbar-nav navbar-right">

                {(() => { 
                  if (this.state.myTicket) { 
                    return <li><a href="{{ url_for('ticket', ticket_id=my_ticket.id) }}">My Request</a></li>;
                  } else {
                    return "";
                  }
                })()}

                {(() => {
                  if (this.state.isAuthenticated) {
                    return (
                      <li className="dropdown">
                        <a href="#" className="dropdown-toggle" data-toggle="dropdown" role="button">{ this.state.currentUser } <span className="caret"></span></a>
                        <ul className="dropdown-menu">
                          <li><a href="/logout/">Log out</a></li>
                        </ul>
                      </li>
                    )
                  } else {
                    return (<li><a href="/login/">Staff Login</a></li>)
                  }
                })()}

              </ul>
            </div>
          </div>
        </nav>


        <div className="queue" >{items}</div>
      </div>
    );
  }
}