function SlotsForm({ assignments }) {
    return (
        <div className="panel panel-primary">
            <div className="panel-body">
                <h4> What do you need help with? </h4>
                <form id="slots-form">
                    <div className="form-group form-group-lg">
                        <div className="input-group">
                            <SelectPicker options={assignments}
                                          className="selectpicker form-control form-left"
                                          data-live-search="true" data-size="8" data-width="60%"
                                          data-style="btn-lg btn-default" id="assignment_id"
                                          name="assignment_id" title="Assignment" required/>
                            <input className="form-control form-right" type="text" id="question"
                                   name="question" title="Question" placeholder="Question"
                                   required/>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}
