let RequestForm = () => {
  let submit = (e) => {
    e.preventDefault();
    let formData = {};
    $('#request-form').serializeArray().forEach((input) => {
      formData[input.name] = input.value;
    });
    app.makeRequest('create', formData, true);
  };

  return (
    <form id="request-form">
      <div className="form-group form-group-lg">
        <div className="input-group">
          <SelectPicker options={ASSIGNMENTS} className="selectpicker form-control form-left" data-live-search="true" data-size="8" data-width="60%" data-style="btn-lg btn-default" id="assignment" name="assignment" title="Assignment" required />
          <input className="form-control form-right" type="number" name="question" id="question" title="Question" placeholder="Question" min="0" step="1" required />
        </div>
      </div>
      <div className="form-group form-group-lg">
        <div className="input-group">
          <SelectPicker options={LOCATIONS} className="selectpicker form-control form-left" id="location" data-width="60%" data-style="btn-lg btn-default" name="location" title="Location" required />
          <div className="input-group-btn form-right pull-left">
            <button className="btn btn-lg btn-default" onClick={submit}>Request</button>
          </div>
        </div>
      </div>
    </form>
  );
};
