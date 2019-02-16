let CheckboxWrapper = ({state, ticket, children, callback}) => {

    let handleChange = (event) => {
        callback(ticket, event.target.checked);
      };
    return(
    <div>
        <div class="form-check pull-left">
        <div className="pull-left ticket-tickbox"><input type="checkbox" class="form-check-input" size="5" id={ticket.id} onClick={handleChange}/>
                
      </div>
                
        </div>
        {children}
        
    
    </div>
    );
};