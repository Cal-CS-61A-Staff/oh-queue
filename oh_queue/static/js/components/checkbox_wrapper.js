class CheckboxWrapper extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.state = {value: false};
  }

  handleChange(event) {
      this.setState({value: event.target.value});
      this.props.onChangeHandler(this.props.ticket, event.target.value);
  }

  render() {
    return(
      
      <div>
        <div class="form-check pull-left">
        <div className="pull-left ticket-tickbox"><input type="checkbox" class="form-check-input" size="5" id={this.props.ticket.id} value={this.state.value} onClick={this.handleChange}/> 
      </div>     
        </div>
        {this.props.children}
    </div>
    )
  }
}