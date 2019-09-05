class AdminAssignmentsManager extends React.Component {
  render() {
    var {assignments} = this.props.state;
    return (
      <div className="container">
        <AdminItemsManager itemName="assignment" items={assignments} />
      </div>
    );
  }
}
