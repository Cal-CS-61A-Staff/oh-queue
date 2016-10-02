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

let Filter = ({filter}) => {
  if (!filter.enabled) return null;

  return (
    <div class="filter">
      Controls go here
    </div>
  );
};
