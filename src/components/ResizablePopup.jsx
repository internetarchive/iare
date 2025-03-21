import React, { useState } from 'react';
import { Rnd } from 'react-rnd';

const ResizablePopup = ({ isOpen, onClose, children }) => {
    const [size, setSize] = useState({ width: 400, height: 300 });
    const [position, setPosition] = useState({ x: 100, y: 100 });

    if (!isOpen) {
        return null;
    }

    const handleResize = (e, direction, ref, delta, position) => {
        setSize({
            width: ref.offsetWidth,
            height: ref.offsetHeight,
        });
        setPosition(position);
    };

    return (
        <Rnd
            size={size}
            position={position}
            onDragStop={(e, d) => { setPosition({ x: d.x, y: d.y }) }}
            onResize={handleResize}
            bounds="window"
        >
            <div style={{
                border: '1px solid black',
                padding: '10px',
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <div style={{
                    backgroundColor: '#eee',
                    padding: '5px',
                    cursor: 'move',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <span>Popup Title</span>
                    <button onClick={onClose}>Close</button>
                </div>
                <div style={{ flex: 1, overflow: 'auto' }}>
                    {children}
                </div>
            </div>
        </Rnd>
    );
};

export default ResizablePopup;