class ErrorView extends React.Component {
  componentWillMount() {
    let query = Qs.parse(this.props.location.search.substring(1));
    let state = this.props.state;

    state.message = query.message || 'Unknown error';
  }

  render() {
    let state = this.props.state;

    return (
      <div className="container error-view">
        <div className="row">
          <div className="col-xs-12">
            <div className="alert alert-danger">
              <p>{ state.message }</p>
            </div>
            <ReactRouter.Link className="btn btn-primary" to="/">Home</ReactRouter.Link>
          </div>
        </div>
      </div>
    );
  }
}
