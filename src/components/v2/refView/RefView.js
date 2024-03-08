import React, {useEffect} from "react";
import Draggable from 'react-draggable';
import {ConfigContext} from "../../../contexts/ConfigContext";
import RefFlock from "../RefFlock";
import RefDetails from "./RefDetails";
import "./refView.css"
import {IARE_ACTIONS} from "../../../constants/iareActions";


export default function RefView({open,
                                    onClose,
                                    onAction,

                                    pageData = {},
                                    refDetails=null,
                                    refFilter=null,
                                    selectedRefIndex=0,

                                    tooltipId
                                }) {

    let myConfig = React.useContext(ConfigContext);
    myConfig = myConfig ? myConfig : {} // prevents "undefined.<param>" errors

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

        // return value is function to call upon component close
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose]);

    const handleRefListClick = React.useCallback((result) => {
        // what happens when reference in ref list clicked:
        //  set refDetails according to reference id

        if (!result) return

        console.log(`RefView: handleRefListClick: result = ${result.action}:${result.value}`)

        if (result.action === "referenceClicked") {

            const refIndex = result.value  // value holds ref index to select

            // send message back up to parent component, which should take care of updating refDetails
            onAction({"action": IARE_ACTIONS.CHANGE_REF_VIEW_SELECTION.key, "value": refIndex})

        }
    }, [onAction])

    // close modal if not in open state
    if (!open) return null;

    const debugAtTop = false && <>
        <div>Debug:</div>
        <div>Current ref index: {selectedRefIndex}</div>
        </>

    return <div className='ref-modal-overlay' onClick={onClose} >
        <Draggable
            handle={".ref-view-title-bar"}
            // defaultPosition={{x: 100, y: 100}}
            position={null}
            // grid={[25, 25]}
            scale={1}
            // accepts strings, like `{x: '10%', y: '10%'}`.
            // positionOffset={{ x: "10%", y: "5%"}}
            positionOffset={{ x: '-50%', y: '-50%' }}

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
                                  // selectedRefIndex={defaultRefIndex}

                                  options={{
                                      hide_header: true,
                                      show_extra: false,
                                      show_ref_nav: true,
                                      show_filter_description: true,
                                      context: "RefView",
                                    }}
                                  tooltipId={"url-display-tooltip"}
                        />
                    </div>

                    <div className="ref-view-details">
                        {debugAtTop}
                        <RefDetails
                            refDetails={refDetails}
                            pageData={pageData}
                            tooltipId={tooltipId}
                            config={myConfig} />
                    </div>

                </div>

            </div>
        </Draggable>
    </div>

}

