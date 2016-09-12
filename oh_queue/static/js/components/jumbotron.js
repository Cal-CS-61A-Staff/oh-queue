class Jumbotron extends React.Component {



  render() {

    if (this.props.myTicket) {
      var subtitleText = [<p className="truncate">Signed in as { this.props.email }</p>];
    } else {
      var subtitleText = [<p className="truncate">Fill out the form to request help</p>];
    }

    return(
      <div className="jumbotron blue">
      <div className="container">
        <section className="page-header">
          <div className="row">

            <div className="col-md-7 col-lg-8">
              {(() => { 
                if (this.props.isAuthenticated) { 
                  return (
                    <div>
                      <h1 className="truncate">Hello, { this.props.shortName }</h1>
                      { subtitleText }
                    </div>
                  );
                } else {
                  return (
                    <div>
                      <h1 className="truncate">Hi! Please sign in</h1>
                      <p className="truncate">Sign in with your course OK account to request help</p>
                    </div>
                  );
                }
              })()}
            </div>

            <div className="col-md-5 col-lg-4">
              <div className="request-form">


                {(() => { 
                  if (!this.props.isAuthenticated) { 
                    return (
                      <a className="btn btn-block btn-jumbo btn-outline" href="/login/">Sign in with Ok</a>
                    );
                  } else if (this.props.myTicket) {
                    return (
                      <a className="btn btn-block btn-jumbo btn-outline" href="{{ url_for('ticket', ticket_id=my_ticket.id) }}">My Request</a>
                    );
                  } else {
                    return (
                      <form action="/create/" method="POST">
                        <div className="form-group form-group-lg">
                          <div className="input-group">
                            <select className="form-control width-60" id="assignment" name="assignment" title="Assignment" required>
                              <option data-tokens="hog proj1 project 1">Hog</option>
                              <option data-tokens="maps proj2 project 2">Maps</option>
                              <option data-tokens="ants proj3 project 3">Ants</option>
                              <option data-tokens="scheme proj4 project 4">Scheme</option>
                              <option data-tokens="hw1 homework 1">Homework 1</option>
                              <option data-tokens="hw2 homework 2">Homework 2</option>
                              <option data-tokens="hw3 homework 3">Homework 3</option>
                              <option data-tokens="hw4 homework 4">Homework 4</option>
                              <option data-tokens="hw5 homework 5">Homework 5</option>
                              <option data-tokens="hw6 homework 6">Homework 6</option>
                              <option data-tokens="hw7 homework 7">Homework 7</option>
                              <option data-tokens="hw8 homework 8">Homework 8</option>
                              <option data-tokens="hw9 homework 9">Homework 9</option>
                              <option data-tokens="hw10 homework 10">Homework 10</option>
                              <option data-tokens="lab1 lab 1">Lab 1</option>
                              <option data-tokens="lab2 lab 2">Lab 2</option>
                              <option data-tokens="lab3 lab 3">Lab 3</option>
                              <option data-tokens="lab4 lab 4">Lab 4</option>
                              <option data-tokens="lab5 lab 5">Lab 5</option>
                              <option data-tokens="lab6 lab 6">Lab 6</option>
                              <option data-tokens="lab7 lab 7">Lab 7</option>
                              <option data-tokens="lab8 lab 8">Lab 8</option>
                              <option data-tokens="lab9 lab 9">Lab 9</option>
                              <option data-tokens="lab10 lab 10">Lab 10</option>
                              <option data-tokens="lab11 lab 11">Lab 11</option>
                              <option data-tokens="lab12 lab 12">Lab 12</option>
                              <option data-tokens="lab13 lab 13">Lab 13</option>
                              <option data-tokens="mt1 mt 1">Midterm 1</option>
                              <option data-tokens="mt1 mt 1">Midterm 2</option>
                              <option data-tokens="mt1 mt 1">Final</option>
                              <option data-tokens="other other 1">Other</option>
                            </select>
                            <input className="form-control width-40" type="number" name="question" id="question" title="Question" placeholder="Question" min="0" step="1" required />
                          </div>
                        </div>
                        <div className="form-group form-group-lg">
                          <div className="input-group">
                            <select className="form-control width-60" id="location" name="location" title="Location" required>
                              <option>109 Morgan</option>
                              <option>237 Cory</option>
                              <option>241 Cory</option>
                              <option>247 Cory</option>
                              <option>Other</option>
                            </select>
                            <span className="input-group-btn width-40 pull-left">
                              <button className="btn btn-lg btn-default" type="submit" value="Submit">Request<span className="hidden-xs"> Help</span></button>
                            </span>
                          </div>
                        </div>
                      </form>
                    );
                  }
                })()}

              </div>
            </div>
          </div>
        </section>
      </div>
      </div>
    );
  }
}