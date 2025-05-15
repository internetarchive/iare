import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { Rnd } from 'react-rnd';

const Popup = ({ isOpen, onClose, title, children }) => {

    const [size, setSize] = useState({ width: 600, height: 480 });
    const [position, setPosition] = useState({ x: 200, y: 200 });
    const [resizeText, setResizeText] = useState("xxx");
    const [isDragging, setIsDragging] = useState(false);

    if (!isOpen) {
        return null;
    }


    const handleResize = (e, direction, ref, delta, position) => {
        console.log("Popup:: handleResize")
        e.stopPropagation()
        e.preventDefault()

        setResizeText(`"Resize: width: ${ref.offsetWidth}, height: ${ref.offsetHeight}, x:${position.x}, y:${position.y}`)

        setSize({
            width: ref.offsetWidth,
            height: ref.offsetHeight,
        })
        setPosition(position)
    };



    const handleDragStart = (e, data) => {
        console.log(`Popup:Rnd: onDragStart`)
        // e.stopPropagation()
        setIsDragging(true)
        e.stopPropagation()
    };

    const handleDragStop = (e, data) => {
        // e.stopPropagation()
        console.log(`Popup:Rnd: onDragStop, setting position to ${data.x}, ${data.y}`)

        if (!isDragging) return; // Ignore if no drag occurred

        // set new position to data[x,y]
        setIsDragging(false); // Reset dragging state
        setPosition({ x: data.x, y: data.y })
        e.preventDefault()
        e.stopPropagation()

    };

    const handleResizeStop = (e, direction, ref, delta, position) => {
        setSize({
            width: ref.offsetWidth,
            height: ref.offsetHeight,
        })
    }

    const handleMouseDown = (e) => {
        console.log("Popup:Rnd: onMouseDown")
        setIsDragging(false)
        e.stopPropagation()
    }

    const stopAndShow = (e, eventName) =>{
        e.stopPropagation()
        console.log(`Popup:Rnd: ${eventName} (stopped propagation)`)
    }


    return ReactDOM.createPortal(
        <Rnd
            className={"rnd-modal-popup"}
            style={{
                pointerEvents: "auto",
            }}

            size={size}
            position={position}
            // bounds="parent"
            bounds="window"

            onResize={handleResize}
            dragHandleClassName="modal-header"

            onDragStart={handleDragStart}
            onDragStop={handleDragStop}
            onMouseDown={handleMouseDown}
            // onMouseMove={ e => {
            //     const now = new Date()
            //     console.log(`Popup: onMouseMove ${now.toString()}`)
            // }}

            // onDrag={(e, d) => {
            //     console.log("Popup:Rnd: Dragging to", d.x, d.y);
            // }}


            onResizeStop={handleResizeStop}
            disableDragging={false} // make sure this is false!
            enableResizing={{
                top: false,
                right: true,
                bottom: true,
                left: false,
                topRight: false,
                bottomRight: true,
                bottomLeft: false,
                topLeft: false,
            }}

        >
            <div
                className="rnd-modal-popup-contents"
                style={{
                    // position: "absolute",
                    border: '1pt solid black',
                    padding: '.35rem',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: "white",
                    pointerEvents: "auto",
                }}

                onClick={(e) => {stopAndShow(e, "contents:onProbeClick")}}
                // onMouseMove={(e) => {stopAndShow(e, "contents:onMouseMove")}}
                // onMouseDown={(e) => {stopAndShow(e, "onMouseDown")}}
                onScroll={(e) => {stopAndShow(e, "contents:onScroll")}}
                onScrollCapture={(e) => {stopAndShow(e, "contents:onScrollCapture")}}

            >

                <div className="modal-header"
                     style={{
                         // backgroundColor: '#bde2cf',
                         // backgroundColor: '#b1dbf7',
                         backgroundColor: 'hsl(204deg 81.4% 83.14%)',
                         border:'1pt solid black',
                         borderRadius:'3pt',
                         padding: '5px',
                         cursor: 'move',
                         display: 'flex',
                         justifyContent: 'space-between',
                         alignItems: 'center',
                         marginBottom: '.5rem',
                     }}>
                    <div style={{overflow:"hidden"}}>
                        <span style={{fontWeight: "bold", overflow:"hidden"}}>{title ? title : "Popup"}</span>
                        <button style={{
                            position:"absolute",
                            borderRadius:"8pt",
                            border:"1px solid grey",
                            right:"10pt",
                            top:"10pt",
                            opacity:"0.85",
                            fontSize:"88%",
                            padding:"1pt 4pt"
                        }} onClick={onClose}>Close</button>
                    </div>
                </div>

                {false && <div className={"debug"}>
                    <div>{isDragging ? "isDragging: true" : "isDragging: false"}</div>
                    <div>ResizeText: {resizeText}</div>
                </div>}

                <div style={{ flex: 1, overflow: 'auto', padding:"0 .3rem .2rem .3rem" }}>
                    {children}
                </div>

            </div>
        </Rnd>,
        document.body
    );
};

export default Popup;