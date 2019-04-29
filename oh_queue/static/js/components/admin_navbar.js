class AdminNavbar extends React.Component {
  render() {
    var { Link } = ReactRouterDOM;
    var { state } = this.props;
    var user = state.currentUser;

    var userDropdown = (<li><a href="/login">Staff Login</a></li>);
    if(user) {
      userDropdown = (
        <li className="dropdown">
          <a href="#" className="dropdown-toggle" data-toggle="dropdown" role="button">{user.name} <span className="caret"></span></a>
          <ul className="dropdown-menu">
            <li><a href="/logout">Log out</a></li>
          </ul>
        </li>
      );
    }

    var links = [
      (<li key="home"><Link to="/admin">Home</Link></li>)
    ];
    if(user) {
      links.push(<li key="assignments"><Link to="/admin/assignments">Assignments</Link></li>);
      links.push(<li key="locations"><Link to="/admin/locations">Locations</Link></li>);
    }

    return (
      <nav className="navbar navbar-default navbar-fixed-top">
        <div className="container">
          <div className="navbar-header">
            <button type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target="#admin-navbar-collapse-section" aria-expanded="false">
              <span className="sr-only">Toggle navigation</span>
              <span className="icon-bar"></span>
              <span className="icon-bar"></span>
              <span className="icon-bar"></span>
            </button>
            <span className="navbar-brand">
              <Link to="/admin"><strong>{ window.courseName } |</strong> <span className="code">Admin</span></Link>
            </span>
          </div>

          <div className="collapse navbar-collapse" id="admin-navbar-collapse-section">
            <ul className="nav navbar-nav">
              {links}
            </ul>
            <ul className="nav navbar-nav navbar-right">
              <li><Link to="/">Queue</Link></li>
              {userDropdown}
            </ul>
          </div>
        </div>
      </nav>
    )
  }
}
