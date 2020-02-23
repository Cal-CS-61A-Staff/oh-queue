class AdminConfigManager extends React.Component {
  constructor(...args) {
    super(...args);

    this.state = {
      loading: {},
      loaded: false,
      isQueueOpen: false,
      descriptionRequired: false,
      welcome: '',
      queueMagicWordMode: 'none',
      queueMagicWordData: '',
      jugglingTimeout: 0,
    };
    this.toggles = {};

    this.initializeToggle = this.initializeToggle.bind(this);
    this.renderToggle = this.renderToggle.bind(this);
    this.changeToggle = this.changeToggle.bind(this);
    this.loadState = this.loadState.bind(this);
    this.editWelcome = this.editWelcome.bind(this);
    this.submitWelcome = this.submitWelcome.bind(this);
    this.changeQueueMagicWordMode = this.changeQueueMagicWordMode.bind(this);
    this.submitQueueMagicWord = this.submitQueueMagicWord.bind(this);
    this.changeQueueMagicWordData = this.changeQueueMagicWordData.bind(this);
    this.changeJugglingTimeout = this.changeJugglingTimeout.bind(this);
    this.submitJugglingTimeout = this.submitJugglingTimeout.bind(this);

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
      welcome: config.welcome || '',
      queueMagicWordMode: config.queue_magic_word_mode,
      jugglingTimeout: parseInt(config.juggling_delay),
    });
    if (config.queue_magic_word_mode === 'text') {
      app.makeRequest('refresh_magic_word', (res) => {
        if (res.magic_word) {
          this.setState({
            queueMagicWordData: res.magic_word
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

  changeQueueMagicWordMode(e) {
    let changes = {
      queueMagicWordMode: e.target.value
    };
    if (e.target.value === 'text') {
      changes.queueMagicWordData = '';
    } else if (e.target.value === 'timed_numeric') {
      let data = '';
      for (let i = 0; i < 8; i++) {
        data += Math.floor(Math.random() * 256).toString(16);
      }
      data += ':60:0:9999'
      changes.queueMagicWordData = data;
    }
    this.setState(changes);
  }
  changeQueueMagicWordData(e) {
    this.setState({
      queueMagicWordData: e.target.value
    });
  }
  submitQueueMagicWord(e) {
    e.preventDefault();

    let btn = $(e.target.elements["btn-submit"]);
    btn.addClass('is-loading');
    btn.attr('disabled', true);
    let time = Date.now();
    app.makeRequest(`update_config`, {
      keys: ['queue_magic_word_mode', 'queue_magic_word_data'],
      values: [this.state.queueMagicWordMode, this.state.queueMagicWordData]
    }, (isSuccess) => {
      setTimeout(() => {
        btn.removeClass('is-loading');
        btn.attr('disabled', false);
      }, 250 - (Date.now() - time));
    });

    return false;
  }

  changeJugglingTimeout(e) {
      this.setState({
          jugglingTimeout: e.target.value,
      });
  }

  submitJugglingTimeout(e) {
    let btn = $(e.target.elements["btn-submit"]);
    btn.addClass('is-loading');
    btn.attr('disabled', true);
    let time = Date.now();
    app.makeRequest(`update_config`, {
      keys: ['juggling_delay'],
      values: [this.state.jugglingTimeout]
    }, (isSuccess) => {
      setTimeout(() => {
        btn.removeClass('is-loading');
        btn.attr('disabled', false);
      }, 250 - (Date.now() - time));
    });
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

    let queueMagicWordOptions = [
      <div className="form-group">
        <select className="form-control" value={this.state.queueMagicWordMode} onChange={this.changeQueueMagicWordMode}>
          <option value="none">None</option>
          <option value="text">Text</option>
          <option value="timed_numeric">Time-based Numeric</option>
        </select>
      </div>
    ];
    if (this.state.queueMagicWordMode === 'text') {
      queueMagicWordOptions.push(
        <div className="form-group">
          <input type="text" className="form-control" value={this.state.queueMagicWordData} onChange={this.changeQueueMagicWordData} required="required" />
        </div>
      );
    }
    queueMagicWordOptions.push(<button className="btn btn-default" name="btn-submit" type="submit">Save</button>);

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
                <td>Should the description field be required for new tickets?</td>
                <td className="col-md-1">
                  {this.renderToggle('description_required', {
                    offText: 'No',
                    onText: 'Yes',
                    value: this.state.descriptionRequired
                  })}
                </td>
               </tr>
               <tr>
                <td>
                  <p>What type of magic word should the queue require to submit new tickets?</p>
                  <ul>
                    <li>Text = staff will provide a hard-coded magic word</li>
                    <li>Time-based Numeric = the magic word will be a 4-digit number that changes every minute. This number is displayed under "Estimated Wait Time" on the homepage (staff view only).</li>
                  </ul>
                </td>
                <td className="col-md-3">
                  <form onSubmit={this.submitQueueMagicWord}>
                    { queueMagicWordOptions }
                  </form>
                </td>
              </tr>
               <tr>
                <td>
                  <p>What should the delay be before students can request to be taken off hold? (in minutes)</p>
                </td>
                <td className="col-md-3">
                  <form onSubmit={this.submitJugglingTimeout}>
                    <div className="form-group">
                      <input type="number" className="form-control" value={this.state.jugglingTimeout} onChange={this.changeJugglingTimeout} required="required" />
                    </div>
                    <button className="btn btn-default" name="btn-submit" type="submit">Save</button>
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
