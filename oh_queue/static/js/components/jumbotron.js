let Jumbotron = ({state}) => {
  if (!state.currentUser) {
    var titleText = 'Hi! Please sign in';
    var subtitleText = 'Sign in with your course OK account to request help';
    var contents = (
      <a className="btn btn-block btn-jumbo btn-outline" href="/login/">
        Sign in with Ok
      </a>
    );
  } else {
    var titleText = `Hello, ${state.currentUser.name}`;
    var subtitleText = 'Fill out the form to request help';
    var contents = <RequestForm/>;
  }

  return (
    <div className="jumbotron blue">
      <div className="container">
        <section className="page-header">
          <div className="row">
            <div className="col-md-7 col-lg-8">
              <h1 className="truncate">{titleText}</h1>
              <p className="truncate">{subtitleText}</p>
            </div>
            <div className="col-md-5 col-lg-4">
              <div className="request-form">
                {contents}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
