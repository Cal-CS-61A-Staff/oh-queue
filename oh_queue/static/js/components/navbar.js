/* React Components */
let Navbar = ({currentUser, myTicket}) => {
  return (
    <nav className="navbar navbar-default navbar-fixed-top">
      <div className="container">
        <div className="navbar-header">
          <button type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar-collapse-section">
            <span className="icon-bar"></span>
            <span className="icon-bar"></span>
            <span className="icon-bar"></span>
          </button>
          <ReactRouter.Link className="navbar-brand" to="/"><strong>CS 61A</strong> Queue</ReactRouter.Link>
        </div>
        <div className="collapse navbar-collapse" id="navbar-collapse-section">
          <ul className="nav navbar-nav navbar-right">

            {(() => {
              if (myTicket) {
                return <li><ReactRouter.Link to={`/${myTicket.id}/`}>My Request</ReactRouter.Link></li>;
              }
            })()}

            {(() => {
              if (currentUser != null) {
                return (
                  <li className="dropdown">
                    <a href="#" className="dropdown-toggle" data-toggle="dropdown" role="button">{currentUser.name} <span className="caret"></span></a>
                    <ul className="dropdown-menu">
                      <li><a href="/logout/">Log out</a></li>
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
