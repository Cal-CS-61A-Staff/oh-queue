class PasswordDisplay extends React.Component {
  constructor(...args) {
    super(...args);

    this.state = {
      loaded: false,
      oldPassword: undefined,
      password: undefined,
      refreshInterval: null
    };

    this.loadState = this.loadState.bind(this);

    this.loadState();
  }

  loadState() {
    if (this.state.loaded) return;
    var config = this.props.state.config;
    if (!this.props.state.loaded || !config) {
      setTimeout(this.loadState, 100);
      return;
    }
    if (isStaff(this.props.state) && config.queue_password_mode !== 'none') {
      if (this.state.refreshInterval) {
        clearInterval(this.state.refreshInterval);
        this.state.refreshInterval = null;
      }
      this.setState({
        refreshInterval: setInterval(() => {
          let mode = this.props.state.config.queue_password_mode;
          if (mode !== 'timed_numeric'
            && (mode !== 'none' || this.state.password !== undefined)) return
          app.makeRequest('refresh_password', (res) => {
            let password = res.password || null;
            this.setState({
              oldPassword: this.state.password,
              password: password
            });
          });
        }, 1000)
      });
    }
    this.setState({
      loaded: true
    });
  }

  componentWillUnmount() {
    if (this.state.refreshInterval) {
      clearInterval(this.state.refreshInterval);
      this.state.refreshInterval = null;
    }
  }

  render() {
    if (!this.state.loaded) {
      this.loadState();
      return false;
    }
    if (this.props.state.config.queue_password_mode === 'none'
      || this.state.password === undefined) {
      return false;
    }

    let passwordElem = (<i>Loading...</i>);
    if (this.state.password) {
      let password = this.state.password;
      passwordElem = (<code>{ password }</code>);
    }

    return (
      <div>
        <h4>Queue password: { passwordElem }</h4>
      </div>
    );
  }
}
