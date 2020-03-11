function ConfigLinkedNumeric({ config, configKey }) {
    const [value, setValue] = React.useState();

    const buttonRef = React.useRef();

    React.useEffect(() => {
        setValue(config[configKey]);
    }, config[configKey]);

    const handleChange = (e) => {
        setValue(e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        buttonRef.current.classList.add("is-loading");
        const time = Date.now();
        app.makeRequest(`update_config`, {
            key: configKey,
            value,
        }, () => {
            setTimeout(
                () => {buttonRef.current.classList.remove("is-loading")},
                250 - (Date.now() - time)
            );
        });
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="form-group">
                <input
                    type="number"
                    className="form-control"
                    required="required"
                    value={value}
                    onChange={handleChange}
                />
            </div>
            <button
                className="btn btn-default"
                name="btn-submit"
                type="submit"
                ref={buttonRef}
            >
                Save
            </button>
        </form>
    )
}
