class SelectPicker extends React.Component {
  render() {
    return (
      <select ref="selectpicker" {...this.props}>
        {this.props.options.map((text) => <option>{text}</option>)}
      </select>
    );
  }

  componentDidMount() {
    $(this.refs.selectpicker).selectpicker('refresh');
  }
}
