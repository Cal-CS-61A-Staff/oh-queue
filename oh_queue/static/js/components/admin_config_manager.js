class AdminConfigManager extends React.Component {
  constructor(...args) {
    super(...args);

    this.state = {
      loading: {},
      loaded: false,
      isQueueOpen: false,
      descriptionRequired: false,
      welcome: ''
    };
    this.toggles = {};

    this.initializeToggle = this.initializeToggle.bind(this);
    this.renderToggle = this.renderToggle.bind(this);
    this.changeToggle = this.changeToggle.bind(this);
    this.loadState = this.loadState.bind(this);
    this.editWelcome = this.editWelcome.bind(this);
    this.submitWelcome = this.submitWelcome.bind(this);

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
      descriptionRequired: config.description_required === 'true',
      welcome: config.welcome || ''
    })
  }
  initializeToggle(toggle) {
    if(!toggle) return;
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

    let btn = e.target.elements[1]
    $(btn).addClass('is-loading');
    $(btn).attr('disabled', true);
    app.makeRequest(`update_config`, {
      key: 'welcome',
      value: this.state.welcome
    }, (isSuccess) => {
      $(btn).removeClass('is-loading');
      $(btn).attr('disabled', false);
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

    return (
      <div className="container">
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Option</th>
                <th className="col-md-1">Value</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Should the queue be open to new tickets?</td>
                <td className="col-md-1">
                  {this.renderToggle('is_queue_open', {
                    offText: 'Closed',
                    onText: 'Open',
                    value: this.state.isQueueOpen
                  })}
                </td>
              </tr>
              <tr>
                <td>Should the description field be required for new tickets?</td>
                <td className="col-md-1">
                  {this.renderToggle('description_required', {
                    offText: 'No',
                    onText: 'Yes',
                    value: this.state.descriptionRequired
                  })}
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
          <ReactMarkdown source={this.state.welcome} />
          <div className="form-group">
            <div>
              <button className="btn btn-default" type="submit">Save</button>
            </div>
          </div>
        </form>
      </div>
    );
  }
}
