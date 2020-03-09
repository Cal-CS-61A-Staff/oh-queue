function AdminAppointmentsManager({ state }) {
    return (
        <AdminOptionsManager>
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
        </AdminOptionsManager>
    );
}
