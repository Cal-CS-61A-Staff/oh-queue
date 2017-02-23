class DescriptionBox extends React.Component {
  constructor(props) {
    super(props);
    this.submit = this.submit.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    let {state, ticket} = this.props;
    this.newDescription = event.target.value;
  }

  submit() {
    let ticket = this.props.ticket;
    app.makeRequest('describe', {'id': ticket.id, 'description': this.newDescription} );
    this.lastSavedDesc = this.newDescription;
  }

  render() {
    let {state, ticket} = this.props;
    let staff = isStaff(state);


    if (staff) {
        return (
        <div className="col-xs-12 col-md-7 col-sm-5">
            <h3 className="description-header"> Description </h3>
                <div>
                  {ticket.description ?  (<p> Student Description: <pre> {ticket.description} </pre></p>) : <p> No description </p>  }
                </div>
            <hr />
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
            <button onClick={this.submit} className={`btn btn-default btn-lg btn-block`}> Save Description </button>
          </div>
          <hr />
      </div>

        );

    }


  }
}
