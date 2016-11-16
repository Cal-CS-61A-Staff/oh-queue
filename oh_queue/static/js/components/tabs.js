/* Mostly from https://toddmotto.com/creating-a-tabs-component-with-react/
 * Use like this:
 *
 * <Tabs selectedIndex={0} onSelect={(index) => ...}>
 *   <Tab label="My Tab">
 *     ... tab content
 *   </Tab>
 *   <Tab label="Other Tab">
 *     ... tab content
 *   </Tab>
 * </Tabs>
 */
let Tabs = ({selectedIndex, onSelect, children}) => {
  let renderLabel = (child, index) => {


    let activeClass = (selectedIndex === index ? 'active' : '');
    if (child.props.shouldHighlight) {
      activeClass += ' pulsating'
    }

    return (
      <li key={index} className={activeClass}>
        <a href="#" onClick={(e) => { e.preventDefault(); onSelect(index); }}>
          {child.props.label}
        </a>
      </li>
    );
  };
  return (
    <div>
      <ul className="nav nav-tabs nav-justified">
        {children.map(renderLabel)}
      </ul>
      <div className="tab-content">
        {children[selectedIndex]}
      </div>
    </div>
  );
}

const Tab = (props) => {
  return (
    <div>
      {props.children}
    </div>
  );
};
