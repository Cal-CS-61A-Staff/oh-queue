function AppointmentCard() {
    return (
        <div className="panel panel-default">
            <div className="panel-heading">
                <h3 className="panel-title">5-6pm in Cory 123 (3 slots remaining)</h3>
                <button className="btn btn-success btn-take-over btn-xs">Sign up</button>
            </div>
            <ul className="list-group">
                <li className="list-group-item">
                    <span className="badge">Hog</span>
                    Anonymous Student
                </li>
                <li className="list-group-item">
                    <span className="badge">Lab 5</span>
                    Anon. Student
                </li>
                <li className="list-group-item">
                    <span className="badge">$$$</span>
                    Anon. Student
                </li>
                <a href="#" className="list-group-item slot-add-button">
                    Add a student
                    {/*Add yourself*/}
                </a>
            </ul>
        </div>
    )
}
