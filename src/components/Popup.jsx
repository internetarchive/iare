import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { Rnd } from 'react-rnd';
import "./css/popup.css"

const Popup = ({ isOpen,
                   onClose,
                   className="",
                   title,
                   children,
                   initialSize = { width: 600, height: 480 },
                   initialPosition = { x: 200, y: 200 },
                   onClickHeader = null
}) => {

    // const [size, setSize] = useState({ width: 600, height: 480 });
    // const [position, setPosition] = useState({ x: 200, y: 200 });
    const [size, setSize] = useState(initialSize)
    const [position, setPosition] = useState(initialPosition)
    const [resizeText, setResizeText] = useState("xxx")
    const [isDragging, setIsDragging] = useState(false)

    if (!isOpen) {
        return null
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
        // console.log("Popup:Rnd: onMouseDown")
        setIsDragging(false)
        e.stopPropagation()
    }

    const stopAndShow = (e, eventName) =>{
        e.stopPropagation()
        console.log(`Popup:Rnd: ${eventName} (stopped propagation)`)
    }


    return ReactDOM.createPortal(
        <Rnd
            className={`rnd-modal-popup${className ? ' ' + className : ''}`}
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
            <div className="rnd-modal-popup-contents">

                {/*// onClick={(e) => {stopAndShow(e, "contents:onProbeClick")}}*/}
                {/*// // onMouseMove={(e) => {stopAndShow(e, "contents:onMouseMove")}}*/}
                {/*// // onMouseDown={(e) => {stopAndShow(e, "onMouseDown")}}*/}
                {/*// onScroll={(e) => {stopAndShow(e, "contents:onScroll")}}*/}
                {/*// onScrollCapture={(e) => {stopAndShow(e, "contents:onScrollCapture")}}*/}

                <div className="modal-header rnd-modal-popup-header"
                onClick={onClickHeader}>
                    <div style={{overflow:"hidden"}}>
                        <span style={{fontWeight: "bold", overflow:"hidden"}}>{title ? title : "Popup"}</span>
                        <button
                            className="rnd-popup-header-close-button"
                            onClick={onClose}
                        >Close</button>
                    </div>
                </div>

                {false && <div className={"debug"}>
                    <div>{isDragging ? "isDragging: true" : "isDragging: false"}</div>
                    <div>ResizeText: {resizeText}</div>
                </div>}

                <div className={"rnd-modal-popup-body"}
                     style={{ flex: 1, overflow: 'auto' }}>
                    {children}
                </div>

            </div>
        </Rnd>,
        document.body
    );
};

export default Popup;