let CheckboxWrapper = ({state, ticket, children, callback}) => {

    let handleChange = (event) => {
        callback(ticket, event.target.checked);
      };
    return(
    <div class="form-check position-absolute">
        <input type="checkbox" class="form-check-input" id={ticket.id} onClick={handleChange}/>
        {children}
    </div>
    );
};