class AdminLocationsManager extends React.Component {
  render() {
    var {locations} = this.props.state;
    return (
      <div className="container">
        <AdminItemsManager itemName="location" items={locations} />
      </div>
    );
  }
}
