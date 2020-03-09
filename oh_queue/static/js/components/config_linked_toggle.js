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
