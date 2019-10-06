function initializeToggle(toggle) {
  if(!toggle) return;
  $(toggle).bootstrapToggle();
}

let RequestForm = ({state}) => {
  let submit = (e) => {
    e.preventDefault();
    let form = $('#request-form');
    let formDOM = form[0];
    if(formDOM.reportValidity && !formDOM.reportValidity()) {
      return;
    }
    let formData = {};
    form.serializeArray().forEach((input) => {
      formData[input.name] = input.value;
    });
    app.makeRequest('create', formData, true);
  };

  let {assignments, locations, tag} = state;

  let filteredAssignments = Object.values(assignments).filter((assignment) => assignment.visible).sort((a, b) => a.name.localeCompare(b.name));
  let filteredLocations = Object.values(locations).filter((location) => location.visible).sort((a, b) => a.name.localeCompare(b.name));
  let filteredTags = Object.values(tags).filter((tag) => location.visible).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <form id="request-form">
      <div className="form-group form-group-lg">
        <div className="input-group">
          <SelectPicker options={filteredAssignments} className="selectpicker form-control form-left" data-live-search="true" data-size="8" data-width="60%" data-style="btn-lg btn-default" id="assignment_id" name="assignment_id" title="Assignment" required />
          <input className="form-control form-right" type="text" id="question" name="question" title="Question" placeholder="Question" required />
        </div>
      </div>
      <div className="form-group form-group-lg">
        <div className="input-group">
          <SelectPicker options={filteredLocations} className="selectpicker form-control form-left" data-live-search="true" data-size="8" data-width="60%" data-style="btn-lg btn-default" id="location_id" name="location_id" title="Location" required />
          <div className="input-group-btn form-right pull-left">
            <button className="btn btn-lg btn-default" onClick={submit}>Request</button>
          </div>
        </div>
      </div>
      <div className="form-group form-group-lg">
        <div className="input-group">
          <div className="btn-group btn-group-lg" role="group" aria-label="Basic example">
            <button type="button" className="btn btn-primary">Debugging</button>
            <button type="button" className="btn btn-default">Content Help</button>
          </div>
        </div>
      
      </div>
    </form>
  );
};
