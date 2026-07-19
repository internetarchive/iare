import React, { useState } from 'react';
import Draggable from 'react-draggable';
// import './App.css';

function DraggableDiv() {
    // State to track if the div is currently being dragged
    const [isDragging, setIsDragging] = useState(false);

    const nodeRef = React.useRef(null);

    // Handlers to change the class based on drag status
    const handleStart = () => setIsDragging(true);
    const handleStop = () => setIsDragging(false);

    return (
        <Draggable nodeRef={nodeRef}
                   onStart={handleStart} onStop={handleStop}>
            <div className={isDragging ? 'drag-box dragging' : 'drag-box idle'}>
                Drag me to a new location!
            </div>
        </Draggable>
    );
}

export default DraggableDiv;
