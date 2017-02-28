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
    app.makeRequest('describe', {'id': ticket.id, 'description': this.newDescription} );
    this.newDescription = null;
    this.setState(this.props.state); // force a render
  }

  render() {
    let {state, ticket} = this.props;
    let staff = isStaff(state);


    if (staff) {
      return (
        <div className="row">
          <div className="col-xs-12 col-md-6 col-md-offset-3">
            <hr />
            <p className="ticket-view-desc">{ticket.description ? ticket.description : <i>No description</i>}</p>
          </div>
        </div>
      );
    } else {
        return (
      <div className="col-xs-12 col-md-7 col-sm-5">
          <h3 className="description-header"> Description </h3>
          <div>
            <p> It would be helpful if you could describe your issue so that a TA can help you.</p>
            <textarea className="description-box" defaultValue={ticket.description} onChange={this.handleChange}
                      rows="5" placeholder="I have a SyntaxError in my ___ function. I've tried using ____ and ____."  />
           {this.newDescription ? <button onClick={this.submit} className={`btn btn-default btn-lg btn-block`}> Save Description </button> : null}
          </div>
          <hr />
      </div>

        );

    }


  }
}
