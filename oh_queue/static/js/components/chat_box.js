function ChatBox() {
    return (
        <div className="panel panel-default">
            <div className="panel-heading">Live Chat</div>
            <div className="panel-body">
                <small>Student 1 </small>
                <div className="chat-bubble">
                    <div>I like cat</div>
                </div>
                <div className="chat-bubble">
                    <div><b>Student 1: </b> I like bat</div>
                </div>
                    <input id="url-selector" type="text" className="form-control" placeholder="Type a message..." required/>
            </div>
        </div>
    )
}
