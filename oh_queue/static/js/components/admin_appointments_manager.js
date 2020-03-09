function AdminAppointmentsManager({ state }) {
    return (
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
                    <td>Should students be able to make appointments?</td>
                    <td className="col-md-1">
                        <ConfigLinkedToggle
                            config={state.config}
                            configKey="appointments_open"
                            offText="No"
                            onText="Yes"
                        />
                    </td>
                </tr>
                </tbody>
            </table>
        </div>
    );
}

function ConfigLinkedToggle({ config, configKey, offText = "No", onText = "Yes" }) {
    if (!app || Object.keys(config).length === 0) {
        return null;
    }
    const handleChange = (value) => {
        const configValue = value ? "true" : "false";
        app.makeRequest(`update_config`, {
            key: configKey,
            value: configValue,
        });
    };

    return <FancyToggle checked={config[configKey] === "true"} offText={offText} onText={onText}
                        onChange={handleChange}/>;
}
