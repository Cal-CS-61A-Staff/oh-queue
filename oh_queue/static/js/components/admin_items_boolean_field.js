function AdminItemsBooleanField({ itemType, propType, item, onText="Yes", offText="No" }) {
    const handleChange = (value) => {
        app.makeRequest("update_location", { id: item.id, [propType]: value });
    }

    return <FancyToggle onText={onText} offText={offText} checked={item[propType]} onChange={handleChange} />;
}
