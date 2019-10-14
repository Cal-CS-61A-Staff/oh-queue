let RequestForm = (props) => {
  let state = props.state;
  let disabled = !!props.disabled;

  let submit = (e) => {
    e.preventDefault();
    let form = $('#request-form');
    let formDOM = form[0];
    if (formDOM.reportValidity && !formDOM.reportValidity()) {
      return;
    }
    let formData = {};
    form.serializeArray().forEach((input) => {
      formData[input.name] = input.value;
    });
    app.makeRequest('create', formData, true);
  };

  let {assignments, locations} = state;

  let filteredAssignments = Object.values(assignments).filter((assignment) => assignment.visible).sort((a, b) => a.name.localeCompare(b.name));
  let filteredLocations = Object.values(locations).filter((location) => location.visible).sort((a, b) => a.name.localeCompare(b.name));

  let passwordInput = false;
  if(state.config && state.config.queue_password_mode !== 'none') {
    passwordInput = (
      <div className="form-group form-group-lg">
        <div className="input-group">
          <input className="form-control" type="text" id="password" name="password" title="Password" placeholder="Password" required disabled={disabled} />
        </div>
      </div>
    );
  }

  return (
    <form id="request-form">
      { passwordInput }
      <div className="form-group form-group-lg">
        <div className="input-group">
          <SelectPicker options={filteredAssignments} className="selectpicker form-control form-left" data-live-search="true" data-size="8" data-width="60%" data-style="btn-lg btn-default" id="assignment_id" name="assignment_id" title="Assignment" required disabled={disabled} />
          <input className="form-control form-right" type="text" id="question" name="question" title="Question" placeholder="Question" required disabled={disabled} />
        </div>
      </div>
      <div className="form-group form-group-lg">
        <div className="input-group">
          <SelectPicker options={filteredLocations} className="selectpicker form-control form-left" data-live-search="true" data-size="8" data-width="60%" data-style="btn-lg btn-default" id="location_id" name="location_id" title="Location" required disabled={disabled} />
          <div className="input-group-btn form-right pull-left">
            <button className="btn btn-lg btn-default" onClick={submit} disabled={disabled}>Request</button>
          </div>
        </div>
      </div>
    </form>
  );
};
