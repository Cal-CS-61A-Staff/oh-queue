function AdminTabs({ currentTab }) {
    return (
        <ul className="nav nav-tabs">
            <li role="presentation" className={currentTab === "admin" ? "active" : ""}>
                <Link to={"/admin"}>General</Link>
            </li>
            <li role="presentation" className={currentTab === "appointments" ? "active" : ""}>
                <Link to={"/admin/appointments"}>Appointments</Link>
            </li>
            <li role="presentation" className={currentTab === "assignments" ? "active" : ""}>
                <Link to={"/admin/assignments"}>Assignments</Link>
            </li>
            <li role="presentation" className={currentTab === "locations" ? "active" : ""}>
                <Link to={"/admin/locations"}>Locations</Link>
            </li>
        </ul>
    );
}
