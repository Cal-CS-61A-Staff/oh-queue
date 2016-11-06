let RequestForm = () => {

  let constructor = (props) => {
    React.Component(props);
    let onlineUrl = getParamFromURL(window.location.search, 'oh_url')
    this.state = {
      isOnline: onlineUrl ? true : false,
      onlineUrl: onlineUrl,
      location: onlineUrl ? 'Online' : ''
    };

    this.handleLocationChange = this.handleLocationChange.bind(this)
    this.onlineForm = this.onlineForm.bind(this)
  }

  let submit = (e) => {
    e.preventDefault();
    let formData = {};
    let hasError = false;

    $('#request-form').serializeArray().forEach((input) => {
      formData[input.name] = input.value;
      if (input.name === "url") {
        if (!input.value || !input.value.includes('http')) {
          swal('Invalid Online URL', 'Please enter a URL that looks like https://collab.cs61a.org/oh/abc', 'error')
          hasError = true;
        }
      }
    });

    if (!hasError) {
      app.makeRequest('create', formData, true);
    }
  };

  let handleLocationChange = (event) => {
    if (event.target.value === "Online") {
      this.state.isOnline = true;
      this.setState();
    }
  }

  let onlineForm = () => {
    if (this.state.isOnline) {
      return (
        <div className="form-group form-group-lg">
          <div className="input-group">
              <input className="form-control width-100" type="url" name="url" id="url" title="Question"
                  defaultValue={this.state.onlineUrl}
                  data-style="btn-lg btn-default" placeholder="https://collab.cs61a.org/oh/abc" required />
          </div>
        </div>
      )
    }
    return;
  }

  return (
    <form id="request-form">
      <div className="form-group form-group-lg">
        <div className="input-group">
          <SelectPicker options={ASSIGNMENTS} className="selectpicker form-control width-60" data-live-search="true" data-size="8" data-width="60%" data-style="btn-lg btn-default" id="assignment" name="assignment" title="Assignment" required />
          <input className="form-control width-40" type="number" name="question" id="question" title="Question" placeholder="Question" min="0" step="1" required />
        </div>
      </div>
      {onlineForm}
      <div className="form-group form-group-lg">
        <div className="input-group">
          <SelectPicker options={LOCATIONS} onChange={handleLocationChange}  className="selectpicker form-control width-60" data-width="60%" id="location" data-width="100%" data-style="btn-lg btn-default" name="location" title="Location" required />
          <span className="input-group-btn width-40 pull-left">
            <button className="btn btn-lg btn-default" onClick={submit}>Request<span className="hidden-xs"> Help</span></button>
          </span>
        </div>
      </div>
    </form>
  );
};