class UpdateLocationBox extends React.Component {
    constructor(props) {
      super(props);
      this.handleChange = this.handleChange.bind(this);
      this.submit = this.submit.bind(this);
    }

    handleChange(event) {
        let {state, ticket} = this.props;
        this.newLocation = event.target.value;
        this.setState(state); //force a re-render
    }

    submit() {
        let ticket = this.props.ticket;
        app.makeRequest('update_location', {'id': ticket.id, 'new_location': this.newLocation} );
        this.setState(this.props.state); //force a render
    }

    render() {
        let {state, ticket} = this.props;
        return(
            <div>
                <h4> If you have moved, please update your new location here:</h4>
                <div className="form-group form-group-lg">
                    <div className="input-group">
                        <SelectPicker onChange={this.handleChange} options={LOCATIONS} className="selectpicker form-control" id="location" data-width="80%" data-style="btn-lg btn-default" name="location" title="Location"/>
                            <div className="input-group-btn form-right pull-left">
                                <button className="btn btn-lg btn-default" onClick={this.submit}>Update</button>
                            </div>
                    </div>
                </div>
            </div>
        );
    }

}