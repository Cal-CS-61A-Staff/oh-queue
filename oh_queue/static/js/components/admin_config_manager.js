class AdminConfigManager extends React.Component {
  constructor(...args) {
    super(...args);

    this.state = {
      loading: {},
      loaded: false,
      isQueueOpen: false,
      welcome: '',
      queuePasswordMode: 'none',
      queuePasswordData: ''
    };
    this.toggles = {};

    this.initializeToggle = this.initializeToggle.bind(this);
    this.renderToggle = this.renderToggle.bind(this);
    this.changeToggle = this.changeToggle.bind(this);
    this.loadState = this.loadState.bind(this);
    this.editWelcome = this.editWelcome.bind(this);
    this.submitWelcome = this.submitWelcome.bind(this);
    this.changeQueuePasswordMode = this.changeQueuePasswordMode.bind(this);
    this.submitQueuePassword = this.submitQueuePassword.bind(this);
    this.changeQueuePasswordData = this.changeQueuePasswordData.bind(this);

    this.loadState();
  }

  loadState() {
    if (this.state.loaded) return;
    var config = this.props.state.config;
    if (!this.props.state.loaded || !config) {
      setTimeout(this.loadState, 100);
      return;
    }
    this.setState({
      loaded: true,
      isQueueOpen: config.is_queue_open === 'true',
      welcome: config.welcome || '',
      queuePasswordMode: config.queue_password_mode
    });
    if (config.queue_password_mode === 'text') {
      app.makeRequest('refresh_password', (res) => {
        if (res.password) {
          this.setState({
            queuePasswordData: res.password
          });
        }
      });
    }
  }
  initializeToggle(toggle) {
    if (!toggle) return;
    var id = toggle.dataset.itemId;
    this.toggles[id] = toggle;
    $(toggle).bootstrapToggle();
    $(toggle).change(() => this.changeToggle(toggle));
  }
  renderToggle(id, options) {
    var isLoading = !!this.state.loading[id];
    return (<input
              ref={this.initializeToggle}
              type="checkbox"
              defaultChecked={options.value}
              disabled={isLoading}
              data-item-id={id}
              data-off={options.offText || 'Off'}
              data-on={options.onText || 'On'}
              data-size="mini"
              data-toggle="toggle"
              onClick={(e) => this.changeToggle(e.target)} />);
  }
  changeToggle(toggle) {
    var id = toggle.dataset.itemId;
    var isChecked = toggle.checked;
    var loadingInner = "Loading...";
    this.setState({
      loading: Object.assign({}, this.state.loading, {
        [id]: true
      })
    }, () => {
      $(this.toggles[id]).parent().addClass('is-loading');
      $(this.toggles[id]).bootstrapToggle('disable');
      app.makeRequest('update_config', {
        key: id,
        value: `${isChecked}`
      }, (isSuccess) => {
        var loading = Object.assign({}, this.state.loading);
        delete loading[id];
        this.setState({
          loading: loading
        });
        $(this.toggles[id]).parent().removeClass('is-loading');
        $(this.toggles[id]).bootstrapToggle('enable');
      });
    });
  }

  editWelcome(e) {
    this.setState({
      welcome: e.target.value
    });
  }
  submitWelcome(e) {
    e.preventDefault();

    let btn = $(e.target.elements["btn-submit"]);
    btn.addClass('is-loading');
    btn.attr('disabled', true);
    let time = Date.now();
    app.makeRequest(`update_config`, {
      key: 'welcome',
      value: this.state.welcome
    }, (isSuccess) => {
      setTimeout(() => {
        btn.removeClass('is-loading');
        btn.attr('disabled', false);
      }, 250 - (Date.now() - time));
    });

    return false;
  }

  changeQueuePasswordMode(e) {
    let changes = {
      queuePasswordMode: e.target.value
    };
    if (e.target.value === 'text') {
      changes.queuePasswordData = '';
    } else if (e.target.value === 'timed_numeric') {
      let data = '';
      for (let i = 0; i < 8; i++) {
        data += Math.floor(Math.random() * 256).toString(16);
      }
      data += ':30:0:9999'
      changes.queuePasswordData = data;
    }
    this.setState(changes);
  }
  changeQueuePasswordData(e) {
    this.setState({
      queuePasswordData: e.target.value
    });
  }
  submitQueuePassword(e) {
    e.preventDefault();

    let btn = $(e.target.elements["btn-submit"]);
    btn.addClass('is-loading');
    btn.attr('disabled', true);
    let time = Date.now();
    app.makeRequest(`update_config`, {
      keys: ['queue_password_mode', 'queue_password_data'],
      values: [this.state.queuePasswordMode, this.state.queuePasswordData]
    }, (isSuccess) => {
      setTimeout(() => {
        btn.removeClass('is-loading');
        btn.attr('disabled', false);
      }, 250 - (Date.now() - time));
    });

    return false;
  }

  render() {
    if (!this.state.loaded) {
      this.loadState();
      return (
        <div className="container">
          <p>Loading...</p>
        </div>
      );
    }

    let queuePasswordOptions = [
      <div className="form-group">
        <select className="form-control" value={this.state.queuePasswordMode} onChange={this.changeQueuePasswordMode}>
          <option value="none">None</option>
          <option value="text">Text</option>
          <option value="timed_numeric">Time-based Numeric</option>
        </select>
      </div>
    ];
    if (this.state.queuePasswordMode === 'text') {
      queuePasswordOptions.push(
        <div className="form-group">
          <input type="text" className="form-control" value={this.state.queuePasswordData} onChange={this.changeQueuePasswordData} required="required" />
        </div>
      );
    }
    queuePasswordOptions.push(<button className="btn btn-default" name="btn-submit" type="submit">Save</button>);

    return (
      <div className="container">
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Option</th>
                <th className="col-md-3">Value</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Should the queue be open to new tickets?</td>
                <td className="col-md-3">
                  {this.renderToggle('is_queue_open', {
                    offText: 'Closed',
                    onText: 'Open',
                    value: this.state.isQueueOpen
                  })}
                </td>
              </tr>
              <tr>
                <td>What type of password should the queue require to submit new tickets?</td>
                <td className="col-md-3">
                  <form onSubmit={this.submitQueuePassword}>
                    { queuePasswordOptions }
                  </form>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <form onSubmit={this.submitWelcome}>
          <div className="form-group">
            <label for="welcome-input">Welcome Message (supports Markdown)</label>
            <textarea className="form-control" name="welcome-input" type="text" placeholder="Welcome" value={this.state.welcome} onChange={this.editWelcome} />
          </div>
          <label>Welcome Message Preview:</label>
          <div className="alert alert-info alert-dismissable fade in" role="alert">
            <button type="button" className="close" aria-label="Close" data-dismiss="alert">
                <span aria-hidden="true">&times;</span>
            </button>
            <ReactMarkdown source={this.state.welcome} />
          </div>
          <div className="form-group">
            <div>
              <button className="btn btn-default" name="btn-submit" type="submit">Save</button>
            </div>
          </div>
        </form>
      </div>
    );
  }
}
