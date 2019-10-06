class AdminTagManager extends React.Component {
  render() {
    var {tags} = this.props.state;
    return (
      <div className="container">
        <AdminItemsManager itemName="tag" items={tags} />
      </div>
    );
  }
}
