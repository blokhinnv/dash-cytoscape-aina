import PropTypes from 'prop-types';
import React, { useState } from "react";
import DropdownButton from 'react-bootstrap/DropdownButton'
import Dropdown from 'react-bootstrap/Dropdown';
import './UndoRedoList.css';


/**
The component is showing list of items. 
Elements above hover are highlighted too.
Expected usage is for undo/redo list demonstration.
*/

export default function UndoRedoList(props) {
        
        

        const [highlightedItem, setHighlightedItem] = useState(0);
        const {id, actions, setProps} = props;
    
        function handleKeyPress(e) {
            if (e.keyCode === 13) {
              handleClose(highlightedItem)
            }
          }
        
        function handleClose(index) {
            setProps({undo_index: index})
            setHighlightedItem(-1)
          }

        return (
            <div id={id} className="undoredo_list">   
                <DropdownButton title="">

                {actions.map((action, index) => (
                    <Dropdown.Item
                        as="button"
                        key={index}
                        className={index <= highlightedItem ? 'highlighted' : null}
                        onMouseLeave={() => setHighlightedItem(-1)}
                        onMouseEnter={() => setHighlightedItem(index)}
                        onFocus={() => setHighlightedItem(index)}
                        onKeyUp={(e) => handleKeyPress(e, index)}
                        onClick={() => handleClose(index)}
                    >
                        {action}
                    </Dropdown.Item>
                ))}
      
                </DropdownButton>     
            </div>
        );
}

UndoRedoList.defaultProps = {
    actions: [],
    undo_index: undefined
};

UndoRedoList.propTypes = {
    /**
     * The ID used to identify this component in Dash callbacks.
     */
    id: PropTypes.string,

    /**
     * An array of history actions
     */
    actions: PropTypes.arrayOf(PropTypes.string),

    /**
     * Index of event, start of which we will undo
     */
    undo_index: PropTypes.number,

    /**
     * Dash-assigned callback that should be called to report property changes
     * to Dash, to make them available for callbacks.
     */
    setProps: PropTypes.func
};
