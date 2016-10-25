class SelectPicker extends React.Component {
  render() {
    let {options, emptyOption} = this.props;
    return (
      <select ref="selectpicker" {...this.props}>
        {emptyOption && <option value="">{emptyOption}</option>}
        {options.map((text) => <option>{text}</option>)}
      </select>
    );
  }

  componentDidMount() {
    $(this.refs.selectpicker).selectpicker('refresh');
  }
}
