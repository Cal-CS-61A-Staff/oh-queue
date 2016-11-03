let FilterControls = ({filter}) => {
  return (
    <Filter filter={filter}/>
  );
};

class Filter extends React.Component {
  updateFilter() {
    app.setFilter({
      assignment: $('#assignment').val(),
      question: $('#question').val(),
      location: $('#location').val(),
    });
  }

  render() {
    let {filter} = this.props;
    return (
      <div className="row form-group form-group-lg">
        <div className="col-xs-12 col-md-4 filter-field">
          <SelectPicker options={ASSIGNMENTS} emptyOption="Any Assignment" className="selectpicker form-control" data-live-search="true" data-size="8" data-width="100%" data-style="btn-lg btn-default" id="assignment" name="assignment" title="Assignment" onChange={() => this.updateFilter()}/>
        </div>
        <div className="col-xs-12 col-md-4 filter-field">
          <input className="form-control" type="number" name="question" id="question" title="Question" placeholder="Question" min="0" step="1" onChange={() => this.updateFilter()}/>
        </div>
        <div className="col-xs-12 col-md-4 filter-field">
          <SelectPicker options={LOCATIONS} emptyOption="Any Location" className="selectpicker form-control" id="location" data-width="100%" data-style="btn-lg btn-default" name="location" title="Location" onChange={() => this.updateFilter()}/>
        </div>
        <hr></hr>
      </div>
    );
  }
};
