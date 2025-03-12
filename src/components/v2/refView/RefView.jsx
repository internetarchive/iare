import React, {useEffect, useState} from "react";
// import Draggable from 'react-draggable';
import {Rnd} from 'react-rnd';
import {ConfigContext} from "../../../contexts/ConfigContext.jsx";
import RefFlock from "../RefFlock.jsx";
import RefDetails from "./RefDetails.jsx";
import "./refView.css"
import {ACTIONS_IARE} from "../../../constants/actionsIare.jsx";

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

    console.log("RefView: entering component")

    const [modalState, setModalState] = useState(() => {
        const savedState = localStorage.getItem(STORAGE_KEY);
        return savedState
            ? JSON.parse(savedState)
            : { x: 100, y: 100, width: 400, height: 250 };
    });


    let myConfig = React.useContext(ConfigContext);
    myConfig = myConfig ? myConfig : {} // prevents "undefined.<param>" errors

    const modalMargin = 100
    const [modalSize, setModalSize] = useState({
        width: window.innerWidth - modalMargin,
        height: window.innerHeight - modalMargin,
    });

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

        const handleResize = () => {
            console.log(`RV: handleResize: width: ${window.innerWidth - modalMargin},height: ${window.innerHeight}`)
            setModalSize({
                width: window.innerWidth - modalMargin,
                height: window.innerHeight - modalMargin,
            });
        };
        window.addEventListener("resize", handleResize);

        // return value is function to call upon component close
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener("resize", handleResize);
        };

    }, [onClose, setModalSize]);


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

    useEffect(() => {
        // Save position & size when modalState changes
        localStorage.setItem(STORAGE_KEY, JSON.stringify(modalState));
    }, [modalState]);

    // close modal if not in open state
    if (!isOpen) return null;

    const debugAtTop = false && <>
        <div>Debug:</div>
        <div>Current ref index: {selectedRefIndex}</div>
        </>

                    // const delete_me = <Draggable
                    //     handle={".ref-view-title-bar"}
                    //     // defaultPosition={{x: 100, y: 100}}
                    //     position={null}
                    //     // grid={[25, 25]}
                    //     scale={1}
                    //     // accepts strings, like `{x: '10%', y: '10%'}`.
                    //     // positionOffset={{ x: "10%", y: "5%"}}
                    //     positionOffset={{ x: '-50%', y: '-50%' }}
                    // ></Draggable>

    return <div className='ref-modal-overlay' xonClick={onClose} >
        <Rnd
            style={{overflow: "hidden", position: "relative"}}
            //// ref={rndRef}
            default={{
                x: (modalMargin) / 2, // Center horizontally
                y: (modalMargin) / 2, // Center vertically
                width: modalSize.width,
                height: modalSize.height,
            }}
            minWidth={500}
            minHeight={400}
            bounds="window"
            //// className="bg-white shadow-lg rounded-lg"
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
            onResize={() => {console.log("FROM WITHIN inResize!!!")}}
        >

            <div className={"ref-modal-container ref-view"}
                 onClick={(e) => {e.stopPropagation()}}
                 onMouseMove={(e) => {e.stopPropagation()}}
                 onScroll={(e) => {e.stopPropagation()}}
                 onScrollCapture={(e) => {e.stopPropagation()}}
            >

                <div className="ref-view-title-bar">
                    {/*<h2>Reference View<RefCitationLinks citationLinks={details.citationLinks} />*/}
                    {/*</h2>*/}
                    <h2>Reference View</h2>
                    <div className="modalRight">
                        <p onClick={onClose} className="closeBtn">X Close</p>
                    </div>
                </div>

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
