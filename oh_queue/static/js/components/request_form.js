let RequestForm = (props) => {
    let state = props.state;
    let disabled = !!props.disabled;
    let appointments = props.appointments;
    let descriptionRequired = state.config.description_required === "true";

    let submit = (e) => {
        e.preventDefault();
        let form = $('#request-form');
        let descriptionBox = $('#description-box');

        let descriptionDOM = descriptionBox[0];
        if (descriptionDOM.reportValidity && !descriptionDOM.reportValidity()) {
            return;
        }

        let formData = {};
        form.serializeArray().forEach((input) => {
            formData[input.name] = input.value;
        });

        formData['description'] = descriptionBox.val();

        app.makeRequest('create', formData, true);
        $('#description-overlay').hide();
    };

    let show = (e) => {
        if (!e.descriptionRequired) {
            return submit(e);
        }
        e.preventDefault();
        let form = $('#request-form');
        let formDOM = form[0];
        if (formDOM.reportValidity && !formDOM.reportValidity()) {
            return;
        }

        let descriptionBox = $('#description-box');

        if (descriptionRequired) {
            descriptionBox.prop('required', true);
        } else {
            descriptionBox.prop('required', false);
        }

        $('#description-overlay').show();
    }

    const history = ReactRouterDOM.useHistory();

    const openAppointments = () => {
        history.push("/appointments");
    };

    let { assignments, locations } = state;

    let filteredAssignments = Object.values(assignments).filter((assignment) => assignment.visible).sort((a, b) => a.name.localeCompare(b.name));
    let filteredLocations = Object.values(locations).filter((location) => location.visible).sort((a, b) => a.name.localeCompare(b.name));

    let magicWordInput = false;
    if (state.config && state.config.queue_magic_word_mode && state.config.queue_magic_word_mode !== 'none') {
        magicWordInput = (
            <div className="form-group form-group-lg">
                <div className="input-group">
                    <input className="form-control" type="password" id="magic-word"
                           name="magic_word" title="Magic Word" placeholder="Magic Word" required
                           disabled={disabled}/>
                </div>
            </div>
        );
    }

    const [locationID, setLocationID] = React.useState(null);

    const handleLocationChange = (e) => {
        setLocationID(e.target.value);
    };

    const showOnlineInput = locationID && state.locations[locationID].name;

    return (
        <div>
            <form id="request-form">
                {magicWordInput}
                {(!disabled || !appointments) && (
                    <React.Fragment>
                        <div className="form-group form-group-lg">
                            <div className="input-group">
                                <SelectPicker options={filteredAssignments}
                                              className="selectpicker form-control form-left"
                                              data-live-search="true" data-size="8" data-width="60%"
                                              data-style="btn-lg btn-default" id="assignment_id"
                                              name="assignment_id" title="Assignment" required
                                              disabled={disabled && !appointments}/>
                                <input className="form-control form-right" type="text" id="question"
                                       name="question" title="Question" placeholder="Question" required
                                       disabled={disabled && !appointments}/>
                            </div>
                        </div>
                        {showOnlineInput && (JSON.parse(state.config.students_set_online_link) || JSON.parse(state.config.students_set_online_doc)) && (
                            <React.Fragment>
                                {JSON.parse(state.config.students_set_online_link) && (
                                    <div className="form-group form-group-lg">
                                        <label htmlFor="call-link">Video Call Link</label>
                                        <input className="form-control" type="text" id="call-link"
                                               name="call-link" title="Video Call Link" placeholder="meet.google.com/xyz" required
                                               disabled={disabled && !appointments}
                                        />
                                    </div>
                                )}
                                {JSON.parse(state.config.students_set_online_doc) && (
                                    <div className="form-group form-group-lg">
                                        <label htmlFor="doc-link">Shared Document Link (optional)</label>
                                        <input className="form-control" type="text" id="doc-link"
                                               name="doc-link" title="Shared Doc Link" placeholder="docs.google.com/xyz" required
                                               disabled={disabled && !appointments}
                                        />
                                    </div>
                                )}
                            </React.Fragment>
                        )}
                        <div className="form-group form-group-lg">
                            <div className="input-group">
                                <SelectPicker options={filteredLocations}
                                              className="selectpicker form-control form-left"
                                              data-live-search="true" data-size="8" data-width="60%"
                                              data-style="btn-lg btn-default" id="location_id"
                                              name="location_id" title="Location" required
                                              onChange={handleLocationChange}
                                              disabled={disabled}/>
                                <div className="input-group-btn form-right pull-left">
                                    <button className="btn btn-lg btn-default" onClick={show}
                                            disabled={disabled}>Request
                                    </button>
                                </div>
                            </div>
                        </div>
                    </React.Fragment>
                )}
                {appointments &&
                <div className="form-group form-group-lg">
                    <button className="btn btn-lg btn-default" onClick={openAppointments}>
                        {disabled ? "Schedule Appointment" : "Or make an appointment"}
                    </button>
                </div>
                }
            </form>
            <div id="description-overlay" className="description-overlay">
                <div id="description-form" className="description-form">
                    <div>
                        <h4> Please describe your issue below: </h4>
                        <textarea id="description-box" className="description-box"
                                  rows="5"
                                  placeholder="It would be helpful if you could describe your issue. For example, &quot;I have a SyntaxError in my ___ function. I've tried using ____ and ____.&quot;"/>
                        <button className="btn btn-lg btn-default" onClick={submit}
                                disabled={disabled}>Request
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
