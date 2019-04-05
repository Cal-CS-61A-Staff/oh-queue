class DescriptionBox extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.submit = this.submit.bind(this);
  }

  handleChange(event) {
    let {state, ticket} = this.props;
    this.newDescription = event.target.value;
    this.setState(state); // force a re-render to get the button to update
  }

  submit() {
    let ticket = this.props.ticket;
    app.makeRequest('update_ticket', {
      id: ticket.id,
      description: this.newDescription
    });
    this.newDescription = null;
    this.setState(this.props.state); // force a render
  }

  render() {
    let {state, ticket} = this.props;
    let staff = isStaff(state);


    if (staff) {
      return (
        <p className="ticket-view-desc">{ticket.description ? ticket.description : <i>No description</i>}</p>
      );
    } else {
      return (
        <div>
          <h4> Please describe your issue below: </h4>
          <textarea className="description-box" defaultValue={ticket.description} onChange={this.handleChange}
          rows="5" placeholder="It would be helpful if you could describe your issue. For example, &quot;I have a SyntaxError in my ___ function. I've tried using ____ and ____.&quot;"  />
          {this.newDescription ? <button onClick={this.submit} className="description-button btn btn-default btn-lg btn-block"> Save Description </button> : null}
        </div>
      );
    }
  }
}
