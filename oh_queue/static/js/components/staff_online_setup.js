function StaffOnlineSetup({ state }) {
    if (!state.currentUser || !state.currentUser.isStaff) {
        return <NotFound />;
    }

    const submit = (e) => {
        e.preventDefault();
        const form = $('#staff-online-setup-form');

        const formData = {};
        form.serializeArray().forEach((input) => {
            formData[input.name] = input.value;
        });

        const btn = $("#submitBtn");

        btn.addClass('is-loading');
        btn.attr('disabled', true);
        const time = Date.now();

        app.makeRequest('update_staff_online_setup', formData,  (isSuccess) => {
            setTimeout(() => {
                btn.removeClass('is-loading');
                btn.attr('disabled', false);
            }, 250 - (Date.now() - time));
        });
    };

    return (
        <div>
          <Navbar state={state} mode="online_setup" />
          <OfflineIndicator offline={state.offline && state.loaded}/>
          <div className="container">
              <br />
              <form id="staff-online-setup-form">
                  <div className="form-group">
                      <label htmlFor="staff-call-link">Your Default Video Call Link</label>
                      <input type="text" className="form-control" id="staff-call-link"
                             name="staff-call-link" placeholder="meet.google.com/xyz"
                             defaultValue={state.currentUser.call_url}
                      />
                  </div>
                  <div className="form-group">
                      <label htmlFor="staff-doc-link">Your Default Shared Document Link</label>
                      <input type="text" className="form-control" id="staff-doc-link"
                             name="staff-doc-link" placeholder="docs.google.com/xyz"
                             defaultValue={state.currentUser.doc_url} />
                  </div>
                  <button id="submitBtn" type="submit" className="btn btn-default" onClick={submit}>Submit</button>
              </form>
          </div>
        </div>
    )
}
