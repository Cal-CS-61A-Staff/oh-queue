/* React Components */
let Navbar = ({state}) => {
  var {currentUser} = state;
  var myTicket = getMyTicket(state);
  var {Link} = ReactRouterDOM;
  return (
    <nav className="navbar navbar-default navbar-fixed-top">
      <div className="container">
        <div className="navbar-header">
          <button type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar-collapse-section">
            <span className="icon-bar"></span>
            <span className="icon-bar"></span>
            <span className="icon-bar"></span>
          </button>
          <Link className="navbar-brand" to="/"><strong>{ window.courseName } |</strong> Queue</Link>
        </div>
        <div className="collapse navbar-collapse" id="navbar-collapse-section">
          <ul className="nav navbar-nav navbar-right">

            {(() => {
              if (currentUser && currentUser.isStaff) {
                return <li><Link to="/admin">Admin</Link></li>;
              }
            })()}

            {(() => {
              if (myTicket) {
                return <li><Link to={`/tickets/${myTicket.id}/`}>My Request</Link></li>;
              }
            })()}

            {(() => {
              if (currentUser) {
                return (
                  <li className="dropdown">
                    <a href="#" className="dropdown-toggle" data-toggle="dropdown" role="button">{currentUser.name} <span className="caret"></span></a>
                    <ul className="dropdown-menu">
                      <li><a href="/logout">Log out</a></li>
                    </ul>
                  </li>
                )
              } else {
                return (<li><a href="/login/">Staff Login</a></li>)
              }
            })()}

          </ul>
        </div>
      </div>
    </nav>
  );
}
