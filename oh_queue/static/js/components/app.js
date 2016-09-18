/* React Components */
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeTickets: [],
      isAuthenticated: false,
      myTicket: null,
    };

    var socket = connectSocket();

    socket.on('state', (state) => {
      console.log(state.isAuthenticated);
      const activeTickets = [];
      state.tickets.forEach((ticket) => { activeTickets.push([ticket.id, ticket]); });
      this.setState({ 
        activeTickets: activeTickets,
        isAuthenticated: state.isAuthenticated,
        currentUser: state.currentUser,
        isStaff: state.isStaff,
        email: state.email,
        shortName: state.shortName
      });
    });

    socket.on('create', function(message) {
      $('#queue').append(message.row_html);
      var details = {
        body: message.user_name + " - " + message.assignment + message.question + " in " + message.location
      }
      if (is_staff) {
        notifyUser("OH Queue: " + message.user_name + " in " + message.location, details);
      }
    });

    socket.on('resolve', function (message) {
      $('#queue-ticket-' + message.id).remove();
    });

    socket.on('assign', function (message) {
      if (message.user_id == current_user_id) {
        notifyUser("61A Queue: Your name has been called by " + message.helper_name, {});
      }
      $('#queue-ticket-' + message.id).replaceWith(message.row_html);
    });

    socket.on('unassign', function (message) {
      $('#queue-ticket-' + message.id).replaceWith(message.row_html);
    });

    socket.on('delete', (ticket) => {
      const activeTickets = [];
      this.state.activeTickets.forEach((ticketArray) => {
        debugger;
        if (ticket.id === ticketArray[1].id) {
          activeTickets.push([ticket.id, ticket]);
        } else {
          activeTickets.push(ticketArray);
        }
      });

      this.setState({ activeTickets })
    });

  }

  render() {
    if (this.state.isStaff || this.state.myTicket) {
      requestNotificationPermission();
    }

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
              <ReactRouter.Link className="navbar-brand" to="/"><strong>CS 61A</strong> Queue</ReactRouter.Link>
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

        {this.props.children && React.cloneElement(this.props.children, {
          isStaff: this.state.isStaff,
          tickets: this.state.activeTickets,
          isAuthenticated: this.state.isAuthenticated,
          shortName: this.state.shortName,
          email: this.state.email,
          myTicket: this.state.myTicket,
          params: this.props.params
        })}

      </div>
    );
  }
}