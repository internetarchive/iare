import React, { useState, useRef } from 'react';
import './css/draggable.css';

const DEFAULT_DDB_WIDTH = "17rem"  // debug-data-box
const DEFAULT_DDB_HEIGHT = "3.5rem"

export default function NativeDraggableDiv() {
    const [position, setPosition] = useState({ x: 800, y: 3 });
    const [isDragging, setIsDragging] = useState(false);
    const dragStart = useRef({ x: 0, y: 0 });

    const handleMouseDown = (e) => {
        setIsDragging(true);
        dragStart.current = {
            x: e.clientX - position.x,
            y: e.clientY - position.y,
        };
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    const handleMouseMove = (e) => {
        setPosition({
            x: e.clientX - dragStart.current.x,
            y: e.clientY - dragStart.current.y,
        });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    };

    // Inline styles replace the need for an external CSS import entirely
    const baseBoxStyle = {
        width: DEFAULT_DDB_WIDTH,
        height: DEFAULT_DDB_HEIGHT,
        color: 'black',
        padding: '.25rem .3rem .25rem .3rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'center',
        textAlign: 'left',
        borderRadius: '8px',
        userSelect: 'none',
        position: 'absolute',
        // right: "10rem",
        left: 0,
        // right: 0,
        top: 0,
        zIndex: 10000,
        // Dynamic positions and styles update based on class/state
        transform: `translate3d(${position.x}px, ${position.y}px, 0px)`,
        // backgroundColor: isDragging ? '#2980b9' : '#3498db',
        backgroundColor: isDragging ? '#1CFF15' : '#2CFF05',  ////'#29b948' : '#63db34',1CFF15
        // backgroundColor: isDragging ? 'red' : 'blue',  ////'#29b948' : '#63db34',1CFF15
        cursor: isDragging ? 'grabbing' : 'grab',
        boxShadow: isDragging ? '0 10px 25px rgba(0,0,0,0.3)' : 'none',
    };

    return (
        <div
            onMouseDown={handleMouseDown}
            className={`draggableDebugBox drag-box ${isDragging ? 'dragging' : 'idle'}`}
            style={baseBoxStyle}
        >
            <div style={{fontSize:"75%",color:"red"}}>debug dragger only in LOCAL env</div>
            <div style={{}}>Drag me safely! Line here! or children!!</div>
        </div>

    );
}
