import React, { useState } from 'react';
import { Rnd } from 'react-rnd';

const ResizablePopup = ({ isOpen, onClose, title, children }) => {
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


    const stopAndShow = (e, caption) =>{
        e.stopPropagation()
        console.log(`stop propagation: ${caption}`)
    }


    return (
        <Rnd
            size={size}
            position={position}

            onDragStop={(e, d) => { setPosition({ x: d.x, y: d.y }) }}
            onResize={handleResize}

            bounds="parent"
            dragHandleClassName="modal-header"

        >
            <div className="modal-content"
                style={{
                    border: '2px solid black',
                    padding: '10px',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: "white",
                    zIndex: 2000,
                }}
                 onClick={(e) => {stopAndShow(e, "onClick")}}
                 onMouseMove={(e) => {stopAndShow(e, "onMouseMove")}}
                 // onMouseDown={(e) => {stopAndShow(e, "onMouseDown")}}
                 onScroll={(e) => {stopAndShow(e, "onScroll")}}
                 onScrollCapture={(e) => {stopAndShow(e, "onScrollCapture")}}

            >
                <div style={{
                    backgroundColor: '#eee',
                    padding: '5px',
                    cursor: 'move',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom:'.5rem',
                }}>
                    <div className="modal-header">
                        <span>{title ? title : "Popup"}</span>
                        <button style={{position:"absolute", right:"10px"}} onClick={onClose}>Close</button>
                    </div>
                </div>

                <div style={{ flex: 1, overflow: 'auto' }}>
                    {children}
                </div>

            </div>
        </Rnd>
    );
};

export default ResizablePopup;