import React, {useEffect, useRef, useState} from "react";
import {Rnd} from 'react-rnd';
import {ConfigContext} from "../../../contexts/ConfigContext.jsx";
import RefFlock from "../RefFlock.jsx";
import RefDetails from "./RefDetails.jsx";
import "./refView.css"
import {ACTIONS_IARE} from "../../../constants/actionsIare.jsx";
import {createInstance} from "i18next";

const STORAGE_KEY = "modalPositionSize";

export default function RefView({
                                    isOpen,
                                    onClose,
                                    onAction,

                                    pageData = {},
                                    refDetails=null,
                                    refFilter=null,
                                    selectedRefIndex=0,

                                    tooltipId
                                }) {


    const modalDefaults = {
        margin: 100,
        minWidth: 500,
        minHeight: 400,
    }
    const refRnd = useRef(null);
    const refContainer = useRef(null);

    const [isDragging, setIsDragging] = useState(false);
    const [size, setSize] = useState({
        // width: modalDefaults.minWidth,
        // height: modalDefaults.minHeight
        width: window.innerWidth - (modalDefaults.margin * 2),
        height: window.innerHeight - (modalDefaults.margin * 2),
    });
    const [position, setPosition] = useState({
        x: modalDefaults.margin,
        y: modalDefaults.margin,
    });



    const handleDragStart = (e, data) => {
        console.log('RefView:handleDragStart', data);
        e.stopPropagation()
        setIsDragging(true)
    };

    const handleDragStop = (e, data) => {
        // set new position to data[x,y]
        if (!isDragging) return; // Ignore if no drag occurred
        setIsDragging(false); // Reset dragging state
        console.log(`Drag Stop, setting position to ${data.x}, ${data.y}`)
        setPosition({ x: data.x, y: data.y })
    };

    const handleMouseDown = () => {
        console.log("RefView:Rnd: onMouseDown")
        setIsDragging(false)
    }

    const handleDrag = (e, data) => {
        console.log('Dragging', data);
    };

    const handleResizeStart = (e, dir, ref) => {
        console.log('Resize Start', dir, ref);
    };

    const handleResize = (e, dir, ref, delta, position) => {
        console.log('Resizing', dir, delta, position);
        // console.log("FROM WITHIN inResize!!!")
        // console.log(`x: ${e.x}`)
        // console.log(`y: ${e.y}`)
        // console.log(`screenX: ${e.screenX}`)
        // console.log(`screenY: ${e.screenY}`)
    }

    const handleResizeStop = (e, dir, ref, delta, position) => {
        console.log('RefView:handleResizeStop', dir, delta, position);
        setSize({ width: ref.offsetWidth, height: ref.offsetHeight });
        //// handleSetPosition(position.x, position.y)
        // setPosition({ x: position.x, y: position.y }); // Update position if needed
    }

    let myConfig = React.useContext(ConfigContext);
    myConfig = myConfig ? myConfig : {} // ensure myConfig is defined; prevents "undefined.<param>" errors
    // i wonder if this works: let myConfig = React.useContext(ConfigContext) || {};

    const urlCount = pageData?.urlDict
        ? Object.keys(pageData.urlDict).length
        : 0
    console.log(`RefView: component entrance; pageData.urlDict.length: ${urlCount}`)

    // const [modalState, setModalState] = useState({
    //     x: (modalDefaults.margin) / 2,
    //     y: (modalDefaults.margin) / 2,
    //     width: window.innerWidth - modalDefaults.margin,
    //     height: window.innerHeight - modalDefaults.margin,
    // });



    // const [modalState, setModalState] = useState(() => {
    //     const savedState = localStorage.getItem(STORAGE_KEY);
    //     return savedState
    //         ? JSON.parse(savedState)
    //         : { x: 100, y: 100, width: 400, height: 250 };
    // });

    // * check resize upon new createInstance
    // * fetch savedSizeParams for modal
    //     * if null, set defaults and save
    // * upon resize or move, save position params
    //     * show in console

    useEffect(() => {
        // adds "Escape Key closes modal" feature

        const handleKeyDown = (event) => {

            // event.stopPropagation()
            // event.preventDefault()

            if (event.key === 'Escape') {
                onClose()
            }

        };
        window.addEventListener('keydown', handleKeyDown);

        // const handleWindowResize = () => {
        //     // resizing containing window resets size to new window size minus border margins
        //     console.log(`RV: window.handleWindowResize: width: ${window.innerWidth - modalDefaults.margin}, height: ${window.innerHeight - modalDefaults.margin}`)
        //     setModalState({
        //         width: window.innerWidth - modalDefaults.margin,
        //         height: window.innerHeight - modalDefaults.margin,
        //     });
        // };
        // window.addEventListener("resize", handleWindowResize);

        // return value is function to call upon component close; we unload event listeners here
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            // window.removeEventListener("resize", handleWindowResize);
        };

    },
        // [onClose, setModalState]);
    [onClose]
    );


    const handleRefListClick = React.useCallback((result) => {
        // what happens when reference in ref list clicked:
        //  set refDetails according to reference id

        if (!result) return

        console.log(`RefView: handleRefListClick: result = ${result.action}:${result.value}`)

        if (result.action === "referenceClicked") {

            const refIndex = result.value  // value holds ref index to select

            // send message back up to parent component, which should take care of updating refDetails
            onAction({"action": ACTIONS_IARE.CHANGE_REF_VIEW_SELECTION.key, "value": refIndex})

        }
    }, [onAction])

                // useEffect(() => {
                //     // Save position & size when modalState changes
                //     localStorage.setItem(STORAGE_KEY, JSON.stringify(modalState));
                // }, [modalState]);

    // close modal if not in open state
    if (!isOpen) return null;

    const debugAtTop = false && <>
        <div>Debug:</div>
        <div>Current ref index: {selectedRefIndex}</div>
        </>

                // const handleSetPosition = (x, y) => {
                //     const container = refContainer.current
                //
                //     if (container) {
                //
                //         // const scrollLeft = container.scrollLeft;
                //         const scrollTop = 0;  //container.scrollTop;
                //
                //         // // container.scrollLeft = 0;
                //         // container.scrollTop = 0;
                //
                //         console.log(`handleSetPosition, setting position to ${x}, ${y}`)
                //         setPosition({ x, y });
                //
                //         // container.scrollLeft = scrollLeft;
                //         if (false && container.parentElement) {
                //             setTimeout(() => {
                //                 container.parentElement.scrollTop = scrollTop;
                //             }, 0);
                //             // container.parentElement.scrollTop = scrollTop;
                //         }
                //
                //     } else {
                //         console.log(`handleSetPosition, no container, setting position to ${x}, ${y}`)
                //         setPosition({ x, y });
                //     }
                // }

    const debugDisplay = false &&
        <div className="ref-view-debug"
             style={{backgroundColor:"green", color: "white !important", padding:"10px"}}>
        <h3>debug</h3>
    </div>

    const refViewTitleBar = <div className="ref-view-title-bar"
                                 style={{position: "sticky", top: 0}}
    >
        <h2>Reference Details</h2>
        <div className="modalRight">
            <p onClick={onClose} className="closeBtn">X Close</p>
        </div>
        {debugDisplay}
    </div>

    const stopAndShow = (e, eventName) =>{
        e.stopPropagation()
        console.log(`RefView:Rnd: ${eventName} (stopped propagation)`)
    }

    // return <div className='ref-modal-overlay' onClick={onClose} >
    return <div
        className='ref-modal-overlay'

        style={{
            // overflow: "auto",
            // position: "relative",
            // pointerEvents: "none", // Ensures interaction with the modal
        }}
        // style={{pointerEvents: "auto"}}

            // onClick={(e) => {e.stopPropagation()}}
            // onMouseMove={(e) => {e.stopPropagation()}}
            // onScroll={(e) => {e.stopPropagation()}}
            // onScrollCapture={(e) => {e.stopPropagation()}}
>
        <Rnd
            ref={refRnd}
            // ref={refContainer}

            className={"rnd-modal-ref-view"}
            //// className="bg-white shadow-lg rounded-lg"
            style={{
                overflow: "auto",
                position: "relative",
                pointerEvents: "auto", // Ensures interaction with the modal
                // zIndex: 1000, // covered in class css
                // style={{overflow: "hidden", position: "relative"}}
                // style={{position: "relative"}}
            }}

            // default size and position - use state
            size={size}
            position={position}
            dragHandleClassName={"ref-view-title-bar"}
            minWidth={modalDefaults.minWidth}
            minHeight={modalDefaults.minHeight}

            onDragStart={handleDragStart}
            onDragStop={handleDragStop}
            onResizeStop={handleResizeStop}
            onMouseDown={handleMouseDown}
                        // onDrag={handleDrag}
                        // onResizeStart={handleResizeStart}
                        // onResize={handleResize}
                        // onScroll={(e) => {e.stopPropagation()}}
                        // onScrollCapture={(e) => {e.stopPropagation()}}

            // bounds="window"
            bounds="parent"
            enableResizing={{
                top: true,
                right: true,
                bottom: true,
                left: true,
                topRight: true,
                bottomRight: true,
                bottomLeft: true,
                topLeft: true,
            }}
            resizeHandleStyles={{
                top: { height: "10px", cursor: "ns-resize" },
                right: { width: "10px", cursor: "ew-resize" },
                bottom: { height: "10px", cursor: "ns-resize" },
                left: { width: "10px", cursor: "ew-resize" },
            }}
            resizeHandleClasses={{
                right: "custom-resize-handle right",
                bottom: "custom-resize-handle bottom",
            }}
        >

            <div className={"ref-view rnd-modal-ref-view-contents"}
                ref={refContainer}

                // style={{overflow:"auto"}}
                style={{
                    overflow: "visible",
                    position: "relative"
                }}

                // turn off event responses on main content, as they will cause unexpected behavior
                onClick={(e) => {stopAndShow(e, "contents:onClick")}}
                onMouseMove={(e) => {stopAndShow(e, "contents::onMouseMove")}}
                // onMouseDown={(e) => {stopAndShow(e, "onMouseDown")}}
                onScroll={(e) => {stopAndShow(e, "contents:onScroll")}}
                onScrollCapture={(e) => {stopAndShow(e, "contents:onScrollCapture")}}
            >

                {refViewTitleBar}

                <div className="ref-view-contents">

                    <div className={"ref-view-list"}>
                        {/* show Ref Flock at left of ref view for navigation */}
                        <RefFlock pageData={pageData}
                                  refArray={pageData.references}
                                  refFilter={refFilter}

                                  onAction={handleRefListClick}  // what happens when flock list clicked
                                  // onKeyDown={handleFlockKeyDown}  // what happens when key down flock list

                                  selectedRefIndex={selectedRefIndex}

                                  options={{
                                      show_header: false,
                                      show_extra: false,
                                      show_ref_nav: true,
                                      show_filter_description: true,
                                      context: "RefView",
                                      caption: "References List",
                                    }}
                                  tooltipId={"url-display-tooltip"}
                        />
                    </div>

                    {/* show ref details in main part of modal window */}
                    <div className="ref-view-details">
                        {debugAtTop}
                        <RefDetails
                            refDetails={refDetails}
                            pageData={pageData}
                            tooltipId={tooltipId}
                            config={myConfig}
                            onAction={onAction}
                        />
                    </div>

                </div>

            </div>
        </Rnd>
    </div>

}
