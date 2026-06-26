import React, {useEffect, useRef, useState} from "react";
import {Rnd} from 'react-rnd';
import {useTranslation} from "react-i18next";
import {ConfigContext} from "../../../../contexts/ConfigContext.jsx";
import {ACTIONS_IARE} from "../../../../constants/actionsIare.jsx";
import RefFlock from "../RefFlock.jsx";
import RefDetails from "./RefDetails.jsx";
import "./refView.css"

export default function RefView({
                                    isOpen,
                                    onClose,
                                    onAction,

                                    pageData = {},
                                    refDetails=null,
                                    refFilter=null,
                                    selectedRefIndex=0,

                                    tooltipId,
                                    showDebug = false,

                                }) {

    const { t, i18n } = useTranslation();

    const modalDefaults = {
        // margin: 100,
        margin: 0,
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


    const [isShowSidebar, setIsShowSidebar] = useState(true);

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
        console.log('RefView Resizing', dir, delta, position);
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


    // close modal if not in open state
    if (!isOpen) return null;

    const debugForRefDetails = showDebug && <div style={{backgroundColor: "green", color: "white", padding:"4pt 8pt", borderRadius: "4pt"}}>
        <div>Debug:</div>
        <div>Current ref index: {selectedRefIndex}</div>
    </div>

    const handleTitleBarDoubleClick = () => {
        const newSize = {
            width: window.innerWidth - (modalDefaults.margin * 2),
            height: window.innerHeight - (modalDefaults.margin * 2)
        };
        const newPosition = {
            x: modalDefaults.margin,
            y: modalDefaults.margin
        };
        setSize(newSize);
        setPosition(newPosition);
    };


    const buttonShowHideSidebar = <button className="small-button utility-button " onClick={() => {
        setIsShowSidebar((prev) => !prev)
    }}>
    <span>{isShowSidebar ? 'Hide Sidebar' : 'Show Sidebar'}</span>
    </button>


    const refViewTitleBar = <div className="ref-view-title-bar"
                                 style={{position: "sticky", top: 0}}
                                 onDoubleClick={handleTitleBarDoubleClick}
    >
        <div className="modalLeft">
            <h2>{t("reference_details", "Reference Details")}<span
            >{buttonShowHideSidebar}</span></h2>
        </div>
        <div className="modalRight">
            <p onClick={onClose} className="closeBtn">X Close</p>
        </div>
    </div>

    /**
     * Debug utility.
     * Stops the propagation of the given event and logs the provided event name.
     *
     * @param {Object} e - The event object.
     * @param {string} eventName - The name of the event to log.
     */
    const stopAndShow = (e, eventName) => {
        e.stopPropagation()
        console.log(`RefView:Rnd: ${eventName} (stopped propagation)`)
    }


    /**
     * Handles action results within the context of RefView component
     *
     * If action is not handled here locally, escalate to onAction
     *
     * @param {Object} result - The result action object containing action and value attributes.
     */
    const handleRefViewAction = (result) => {

        // for now, no local handling...pass on up always...

        // const {action, value} = result;
        // console.log (`RefView: handleRefViewAction: action=${action}, value=${value}`);

        // // handle Signal Details popup click - "value" is urlLink
        // if (action === ACTIONS_IARE.POPUP_SIGNALS_DETAILS.key) {
        //     const urlLink = value
        //     const urlObj = pageData.urlDict[urlLink]
        //     const rawSignalData = urlObj.signal_data
        //
        //     setSignalDetailsPopupTitle(<SignalDataDetailsTitle urlLink={urlLink}/>)
        //     setSignalDetailsPopupContents(<SignalDataDetails
        //         urlLink={urlLink}
        //         rawSignalData={rawSignalData}
        //         tooltipId={tooltipId}
        //     />)
        //     setIsSignalDetailsPopupOpen(true)
        //     return
        // }

        // else send up action tree
        onAction(result)
    }
    
    return <div className='ref-modal-overlay'>
        <Rnd
            ref={refRnd}

            className={"rnd-modal-ref-view"}

            style={{
                overflow: "auto",
                position: "relative",
                pointerEvents: "auto", // Ensures interaction with the modal
                // zIndex: 1000, // covered in class css
                // style={{overflow: "hidden", position: "relative"}}
                // style={{position: "relative"}}
            }}


            size={size}  // default size and position - use state
            position={position}
            dragHandleClassName={"ref-view-title-bar"}
            minWidth={modalDefaults.minWidth}
            minHeight={modalDefaults.minHeight}

            // onDragStart={handleDragStart}
            // onDragStop={handleDragStop}
            onResizeStop={handleResizeStop}
            onMouseDown={handleMouseDown}
                        // onDrag={handleDrag}
                        // onResizeStart={handleResizeStart}
            onResize={handleResize}
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

                // turn off event responses on main content, as they will cause unexpected behavior
                onClick = {
                    (e) => {
                        stopAndShow(e, "contents:onProbeClick")
                    }
                }
                // onMouseMove={(e) => {stopAndShow(e, "contents::onMouseMove")}}
                // onMouseDown={(e) => {stopAndShow(e, "onMouseDown")}}
                onScroll={(e) => {stopAndShow(e, "contents:onScroll")}}
                onScrollCapture={(e) => {stopAndShow(e, "contents:onScrollCapture")}}
            >

                {refViewTitleBar}

                <div className="ref-view-container">

                    {/* show Ref Flock as left sidebar for navigation */}
                    {isShowSidebar && <div className={"ref-view-sidebar"}>
                        <RefFlock pageData={pageData}
                                  refArray={pageData.references}
                                  refFilter={refFilter}
                                  options={{
                                      show_header: false,
                                      show_extra: false,
                                      show_ref_nav: true,
                                      show_filter_description: true,
                                      context: "RefView",
                                      caption: "References List",
                                  }}
                                  tooltipId={tooltipId}

                                  className={"ref-view-ref-list"}
                                  onAction={handleRefListClick}  // what happens when flock list clicked
                                  // onKeyDown={handleFlockKeyDown}  // what happens when key down flock list
                                  selectedRefIndex={selectedRefIndex}
                        />
                    </div>}

                    {/* show ref details in main part of modal window */}
                    <div className="ref-view-body">
                        {debugForRefDetails}
                        <RefDetails
                            refDetails={refDetails}
                            pageData={pageData}
                            tooltipId={tooltipId}
                            config={myConfig}
                            onAction={handleRefViewAction}
                        />
                    </div>

                </div>

            </div>
        </Rnd>

    </div>
}
