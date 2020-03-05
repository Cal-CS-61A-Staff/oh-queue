function AppointmentOverlay({ staffMode, assignments, signup, onSubmit }) {
    const [email, setEmail] = React.useState("");
    const [assignment, setAssignment] = React.useState("");
    const [question, setQuestion] = React.useState("");
    const [description, setDescription] = React.useState("");

    React.useEffect(() => {
        if (signup) {
            setEmail(signup.user.email || "");
            setAssignment(signup.assignment_id || "");
            setQuestion(signup.question || "");
            setDescription(signup.description || "");
        } else {
            setEmail("");
            setAssignment("");
            setQuestion("");
            setDescription("");
        }
    }, [signup]);

    const handleClick = () => {
        onSubmit({
            email,
            assignment,
            question,
            description,
        })
    };

    const handleCancel = () => {
        app.makeRequest("unassign_appointment", signup.id);
        $("#appointment-overlay").modal("hide");
    };

    return ReactDOM.createPortal(
        <div className="modal fade" id="appointment-overlay" tabIndex="-1" role="dialog">
            <div className="modal-dialog" role="document">
                <div className="modal-content">
                    <div className="modal-header">
                        <button type="button" className="close" data-dismiss="modal"
                                aria-label="Close"><span aria-hidden="true">&times;</span></button>
                        <h4 className="modal-title">
                            {staffMode ?
                                "Create / Edit Appointment" : "What do you need help with?"}
                        </h4>
                    </div>
                    <div className="modal-body">
                        {!staffMode && (
                            <p>
                                Leave fields blank if you aren't yet sure what you want to ask about.
                            </p>
                        )}
                        <SlotsForm
                            assignments={assignments}
                            email={email}
                            onEmailChange={setEmail}
                            selectedAssignment={assignment}
                            onSelectedAssignmentChange={setAssignment}
                            question={question}
                            onQuestionChange={setQuestion}
                            description={description}
                            onDescriptionChange={setDescription}
                            showEmail={staffMode && !signup}
                        />
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-default"
                                data-dismiss="modal">Close
                        </button>
                        {signup && (
                            <button
                                type="button"
                                className="btn btn-danger"
                                onClick={handleCancel}
                            >Cancel Appointment</button>
                        )}
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={handleClick}
                        >Confirm</button>
                    </div>
                </div>
            </div>
        </div>,
        document.body,
    );
}
