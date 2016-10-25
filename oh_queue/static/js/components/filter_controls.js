let FilterControls = ({filter}) => {
  return (
    <div className="filter-contols">
      <button
        className={"btn btn-primary btn-lg" + (filter.enabled ? ' active' : '')}
        onClick={() => app.toggleFilter()}>
        Toggle Filter
      </button>
      <Filter filter={filter}/>
    </div>
  );
};

class Filter extends React.Component {
  updateFilter() {
    app.setFilter({
      enabled: true,
      assignment: $('#assignment').val(),
      question: $('#question').val(),
      location: $('#location').val(),
    });
  }

  render() {
    let {filter} = this.props;
    if (!filter.enabled) return null;

    return (
      <div class="filter">
        <div className="form-group form-group-lg">
          <SelectPicker options={ASSIGNMENTS} className="selectpicker form-control width-60" data-live-search="true" data-size="8" data-width="60%" data-style="btn-lg btn-default" id="assignment" name="assignment" title="Assignment" onChange={() => this.updateFilter()}/>
          <input className="form-control width-40" type="number" name="question" id="question" title="Question" placeholder="Question" min="0" step="1" onChange={() => this.updateFilter()}/>
          <SelectPicker options={LOCATIONS} className="selectpicker form-control width-60" id="location" data-width="100%" data-style="btn-lg btn-default" name="location" title="Location" onChange={() => this.updateFilter()}/>
        </div>
      </div>
    );
  }
};
