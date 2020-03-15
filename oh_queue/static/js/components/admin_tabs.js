function AdminTabs({ currentTab }) {
    if (currentTab === "admin") {
        currentTab = "general";
    }

    const links = ["general", "appointments", "assignments", "locations", "online"];

    const body = links.map((link, index) => (
            <li role="presentation" className={currentTab === link ? "active" : ""}>
                <Link to={index ? "/admin/" + link : "/admin"}>{link[0].toUpperCase() + link.slice(1)}</Link>
            </li>
        )
    );

    return (
        <ul className="nav nav-tabs">
            {body}
        </ul>
    );
}
