class DescriptionBox extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.submit = this.submit.bind(this);

    this.piazzaFeedback = this.piazzaFeedback.bind(this);
    this.searchPiazza = this.searchPiazza.bind(this);

    this.searchPiazza()
  }

  handleChange(event) {
    let {state, ticket} = this.props;
    this.newDescription = event.target.value;
    this.setState(state); // force a re-render to get the button to update
  }

  submit() {
    let ticket = this.props.ticket;
    app.makeRequest('describe', {'id': ticket.id, 'description': this.newDescription} );
    // Search Piazza if available
    this.searchPiazza(this.newDescription);
    this.newDescription = null;
    this.setState(this.props.state); // force a render
  }

  piazzaFeedback(e, postId, semester, vote) {
    let {state, ticket} = this.props;
    e.persist() // Use the event in the async callback.
    axios.post(`https://oh-help.cs61a.org/api/v1/algolia/vote`, {
      user: this.state.currentUser.hash,
      post: postId,
      semester: semester,
      assignment: ticket.assignment,
      question: ticket.question,
      description: ticket.description,
      vote: vote
    }).then(res => {
      alert("Thanks for your feedback");
    });
  }

  searchPiazza(description) {
    let ticket = this.props.ticket;
    let assgn = ticket.assignment.replace('Project', 'Proj').replace('Homework', 'HW');
    let assignment = assgn + " Q" + ticket.question
    let query = encodeURIComponent(assignment)
    let user = encodeURIComponent(this.props.state.currentUser.hash)

    if (description) {
      query += ' ' + description;
    }

    axios.get(`https://oh-help.cs61a.org/api/v1/algolia/search?query=` + query + '&user=' + user)
      .then(res => {
        this.piazzaResults = []
        var post;
        for (var i in res.data['results']) {
          if (i <= 4) {
            post = res.data['results'][i];
            this.piazzaResults.push(<div>
              <a href={post.url}> {post.subject} </a>
              <small>({post.semester})</small>
              <div className="btn-toolbar btn-group pull-right piazza-vote" role="toolbar" aria-label="Rating">
                <div className="btn btn-default btn-small" onClick={(e) => this.piazzaFeedback(e, post.qid, post.semester, 'up')} role="group" aria-label="Thumbs Up">👍</div>
                <div className="btn btn-default btn-small" onClick={(e) => this.piazzaFeedback(e, post.qid, post.semester, 'down')} role="group" aria-label="Thumbs Down">👎</div>
              </div>
              <hr></hr>
            </div>)
          }
        }
        this.setState(this.props.state); // force a render
      });
  }

  render() {
    let {state, ticket} = this.props;
    let staff = isStaff(state);


    if (staff) {
      return (
        <p className="ticket-view-desc">{ticket.description ? ticket.description : <i>No description</i>}</p>
      );
    } else {
      return (
        <div>
          <h4> Please describe your issue below: </h4>
          <textarea className="description-box" defaultValue={ticket.description} onChange={this.handleChange}
          rows="5" placeholder="It would be helpful if you could describe your issue. For example, &quot;I have a SyntaxError in my ___ function. I've tried using ____ and ____.&quot;"  />
          {this.newDescription ? <button onClick={this.submit} className="description-button btn btn-default btn-lg btn-block"> Save Description </button> : null}
          {this.piazzaResults ? <div>
                                  <p> While you are waiting - check out these resources: </p>
                                  { this.piazzaResults }
                                </div> : null}
        </div>
      );
    }
  }
}
