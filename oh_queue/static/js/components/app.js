/* React Components */
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loaded: false,
      activeTickets: [],
      isAuthenticated: false,
    };

    socket.on('state', (state) => {
      console.log(state.isAuthenticated);
      const activeTickets = [];
      state.tickets.forEach((ticket) => { activeTickets.push([ticket.id, ticket]); });
      this.setState({
        loaded: true,
        activeTickets: activeTickets,
        isAuthenticated: state.isAuthenticated,
        currentUser: state.currentUser,
        currentUserID: state.currentUserID,
        isStaff: state.isStaff,
        email: state.email,
        shortName: state.shortName
      });
    });

    socket.on('create', (ticket) => {
      const activeTickets = this.state.activeTickets;
      activeTickets.push([ticket.id, ticket]);
      this.setState({ activeTickets });
      var details = {
        body: ticket.user_name + " - " + ticket.assignment + ticket.question + " in " + ticket.location
      }
      if (this.state.isStaff) {
        notifyUser("OH Queue: " + ticket.user_name + " in " + ticket.location, details);
      }
    });

    socket.on('resolve', (ticket) => {
      const activeTickets = [];
      this.state.activeTickets.forEach((ticketArray) => {
        if (ticket.id === ticketArray[1].id) {
          activeTickets.push([ticket.id, ticket]);
        } else {
          activeTickets.push(ticketArray);
        }
      });

      this.setState({ activeTickets })
    });

    socket.on('assign', (ticket) => {
      if (ticket.user_id == this.state.currentUserID) {
        notifyUser("61A Queue: Your name has been called by " + ticket.helper_name, {});
      }

      const activeTickets = [];
      this.state.activeTickets.forEach((ticketArray) => {
        if (ticket.id === ticketArray[1].id) {
          activeTickets.push([ticket.id, ticket]);
        } else {
          activeTickets.push(ticketArray);
        }
      });

      this.setState({ activeTickets })
    });

    socket.on('unassign', (ticket) => {
      const activeTickets = [];
      this.state.activeTickets.forEach((ticketArray) => {
        if (ticket.id === ticketArray[1].id) {
          activeTickets.push([ticket.id, ticket]);
        } else {
          activeTickets.push(ticketArray);
        }
      });

      this.setState({ activeTickets })
    });

    socket.on('delete', (ticket) => {
      const activeTickets = [];
      this.state.activeTickets.forEach((ticketArray) => {
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
    let tickets = this.state.activeTickets;
    let myTicketArray = tickets.find((ticketArray) => {
      let ticket = ticketArray[1];
      return ticket.user_id === this.state.currentUserID &&
        (ticket.status === 'pending' || ticket.status === 'assigned');
    });
    let myTicket = myTicketArray ? myTicketArray[1] : null;

    if (this.state.isStaff || myTicket) {
      requestNotificationPermission();
    }

    if (!this.state.loaded) return null;

    // TODO hack for navbar
    let currentUser = {
      isAuthenticated: this.state.isAuthenticated,
      id: this.state.currentUserID,
      name: this.state.currentUser,
    };

    return (
      <div>
        <Navbar currentUser={currentUser} myTicket={myTicket} />

        {this.props.children && React.cloneElement(this.props.children, {
          isStaff: this.state.isStaff,
          tickets: this.state.activeTickets,
          isAuthenticated: this.state.isAuthenticated,
          currentUserID: this.state.currentUserID,
          shortName: this.state.shortName,
          email: this.state.email,
          myTicket: myTicket,
          params: this.props.params
        })}

      </div>
    );
  }
}
