function AppointmentOverlay({ assignments, onSubmit }) {
    const [assignment, setAssignment] = React.useState("");
    const [question, setQuestion] = React.useState("");
    const [description, setDescription] = React.useState("");

    const active = Math.min(assignment.length, question.length, description.length) > 0;

    const handleClick = () => {
        onSubmit({
            assignment,
            question,
            description,
        })
    };

    return ReactDOM.createPortal(
        <div className="modal fade" id="appointment-overlay" tabIndex="-1" role="dialog"
             aria-labelledby="myModalLabel">
            <div className="modal-dialog" role="document">
                <div className="modal-content">
                    <div className="modal-header">
                        <button type="button" className="close" data-dismiss="modal"
                                aria-label="Close"><span aria-hidden="true">&times;</span></button>
                        <h4 className="modal-title" id="myModalLabel">What do you need help with?</h4>
                    </div>
                    <div className="modal-body">
                        <SlotsForm
                            assignments={assignments}
                            selectedAssignment={assignment}
                            onSelectedAssignmentChange={setAssignment}
                            question={question}
                            onQuestionChange={setQuestion}
                            description={description}
                            onDescriptionChange={setDescription}
                        />
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-default"
                                data-dismiss="modal">Close
                        </button>
                        <button
                            type="button"
                            className="btn btn-primary"
                            disabled={!active}
                            onClick={handleClick}
                        >Confirm</button>
                    </div>
                </div>
            </div>
        </div>,
        document.body,
    );
}
