class TicketList extends React.Component {
    constructor(props) {
        super(props);
        let {state, status} = this.props;
        let tickets = getTickets(state, status);
        let filteredTickets = applyFilter(state.filter, tickets);
        let selectedTickets = new Map();

        this.state = {tickets: tickets, selectedTickets: selectedTickets};
        this.selectTicketCallback = this.selectTicketCallback.bind(this);
        this.handleActionSelected = this.handleActionSelected.bind(this);
      }
      
      handleActionSelected(action) {
        let selected_ticket_ids = [];
        this.state.selectedTickets.forEach((value, key) => {
          if(value) selected_ticket_ids.push(key);
        });
        this.setState(state => {
            return {
                tickets: state.tickets,
                selectedTickets: new Map()
            }
        });
        app.makeRequest(action, selected_ticket_ids);
      }

      selectTicketCallback(ticket, select) {
            this.setState(state => {
                return {
                tickets: state.tickets,
                selectedTickets: (new Map(state.selectedTickets)).set(ticket, select)
                }
            });
      }

      render() {
        let {state, status} = this.props;
        let tickets = getTickets(state, status)
        let filteredTickets = applyFilter(state.filter, tickets);
        let selectedTickets = this.state.selectedTickets;
        let items = null;
        if(isStaff(state)) {
            items = filteredTickets.map((ticket) =>
            <CheckboxWrapper state={state} key={ticket.id} value={selectedTickets.get(ticket.id) || false} onChangeHandler={this.selectTicketCallback} ticket={ticket}>
                <Ticket state={state} ticket={ticket} />
            </CheckboxWrapper>
        );
        } else {
            items = filteredTickets.map((ticket) =>
                <Ticket key={ticket.id} state={state} ticket={ticket}/>
            );
        }

        console.log(items);

        var body;
        if (filteredTickets.length === 0) {
        body = (
            <div className="no-results">
            <h4>No help requests</h4>
            </div>
        );
        } else if (items.length === 0) {
        body = (
            <div className="no-results">
            <h4>No help requests matched your search</h4>
            </div>
        );
        } else {
        body = [
            <GroupActions tickets={filteredTickets} status={status} state={state} selectedTickets={selectedTickets} handleActionSelected={this.handleActionSelected}/>,
            items,
        ];
        }
    
        return (
        <div className="queue">
            {body}
        </div>
        );
      }
}
