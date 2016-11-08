class RequestForm extends React.Component {
  constructor(props) {
    super(props);
    let onlineUrl = this.props.onlineUrl;
    this.state = {
      isOnline: onlineUrl ? true : false,
      onlineUrl: onlineUrl,
      location: onlineUrl ? 'Online' : ''
    };

    this.handleLocationChange = this.handleLocationChange.bind(this)
  }

  submit(e) {
    e.preventDefault();
    let formData = {};
    let hasError = false;

    $('#request-form').serializeArray().forEach((input) => {
      formData[input.name] = input.value;
      if (input.name === "url") {
        if (!input.value || !input.value.includes('http')) {
          swal({
            title: 'Need a Collab URL',
            text: "Paste in a collab URL by going to https://collab.cs61a.org/help/start/",
            type: 'warning',
            showCancelButton: false,
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'Get a Collab URL',
            confirmButtonClass: 'btn btn-success',
            buttonsStyling: false
          }).then(function() {
            var win = window.open('https://collab.cs61a.org/help/start/', '_blank');
            win.focus();
            swal("Now paste the URL into the field", 'It should look like https://collab.cs61a.org/help/abcd');
          }, function(dismiss) {
            // dismiss can be 'cancel', 'overlay',
            // 'close', and 'timer'
          })
          hasError = true;
        }
      }
    });

    if (!hasError) {
      app.makeRequest('create', formData, true);
    }
  }

  handleLocationChange(event) {
      if (event.target.value === "Online") {
        this.state.isOnline = true;
        this.setState();
      }
    }

  render() {
    return (
      <form id="request-form">
        <div className="form-group form-group-lg">
          <div className="input-group">
            <SelectPicker options={ASSIGNMENTS} className="selectpicker form-control width-60" data-live-search="true" data-size="8" data-width="60%" data-style="btn-lg btn-default" id="assignment" name="assignment" title="Assignment" required />
            <input className="form-control width-40" type="number" name="question" id="question" title="Question" placeholder="Question" min="0" step="1" required />
          </div>
        </div>
         {this.state.isOnline &&
            <div className="form-group form-group-lg">
              <div className="input-group">
                  <input className="form-control width-100" type="url" name="url" id="url" title="Question"
                      defaultValue={this.state.onlineUrl}
                      data-style="btn-lg btn-default" placeholder="https://collab.cs61a.org/oh/abc" required />
              </div>
            </div>
          }
        <div className="form-group form-group-lg">
          <div className="input-group">
            <SelectPicker options={LOCATIONS} onChange={this.handleLocationChange}  className="selectpicker form-control width-60" data-width="60%" id="location" data-style="btn-lg btn-default" name="location" title="Location" required />
            <span className="input-group-btn width-40 pull-left" data-width="40%">
              <button className="btn btn-lg btn-default" onClick={this.submit}>Request<span className="hidden-xs"> Help</span></button>
            </span>
          </div>
        </div>
      </form>
      );

  }
}
