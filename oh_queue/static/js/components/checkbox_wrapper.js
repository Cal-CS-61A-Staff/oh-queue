class CheckboxWrapper extends React.Component {
  constructor(props) {
    super(props);
    this.submit = this.submit.bind(this);
  }

  submit(e) {
    this.props.onChangeHandler(this.props.ticket.id, e.target.value);
  }

  render() {
    return(
      <div>
        <div class="form-check pull-left">
        <div className="pull-left ticket-tickbox"><input type="checkbox" class="form-check-input" size="5" id={this.props.ticket.id} value={this.props.value} onClick={this.submit}/> 
      </div>     
        </div>
        {this.props.children}
    </div>
    )
  }
}