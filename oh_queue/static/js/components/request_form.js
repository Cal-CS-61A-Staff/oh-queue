class RequestForm extends React.Component {
  submit(e) {
    e.preventDefault();
    let formData = {};
    $('#request-form').serializeArray().forEach((input) => {
      formData[input.name] = input.value;
    });
    socket.emit('create', formData, goToTicket);
  }

  componentDidMount() {
    $('.selectpicker').selectpicker('refresh');
  }

  render() {
    return (
      <form id="request-form">
        <div className="form-group form-group-lg">
          <div className="input-group">
            <select className="selectpicker form-control width-60" data-live-search="true" data-size="8" data-width="60%" data-style="btn-lg btn-default" id="assignment" name="assignment" title="Assignment" required>
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
            <select className="selectpicker form-control width-60" id="location" data-width="100%" data-style="btn-lg btn-default" name="location" title="Location" required>
              <option>109 Morgan</option>
              <option>237 Cory</option>
              <option>241 Cory</option>
              <option>247 Cory</option>
              <option>Other</option>
            </select>
            <span className="input-group-btn width-40 pull-left">
              <button className="btn btn-lg btn-default" onClick={this.submit}>Request<span className="hidden-xs"> Help</span></button>
            </span>
          </div>
        </div>
      </form>
    );
  }
}
