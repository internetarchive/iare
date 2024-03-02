import React, {useEffect, useState} from "react";
import Draggable from 'react-draggable';
import {ConfigContext} from "../../../contexts/ConfigContext";
import {ArticleVersions} from "../../../constants/articleVersions";
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

    // eslint-disable-next-line

    // const [selectedRefIndex, setSelectedRefIndex]= useState(defaultRefIndex)
    //
    // const [refDetails, setRefDetails]= useState((defaultRefIndex === undefined || defaultRefIndex === null)
    //     // default ref details
    //     ? null
    //     :
    // )

    let myConfig = React.useContext(ConfigContext);
    myConfig = myConfig ? myConfig : {} // prevents "undefined.<param>" errors

    // adds "Escape Key closes modal" feature
    useEffect(() => {
        const handleKeyDown = (event) => {

            // event.stopPropagation()
            // event.preventDefault()

            if (event.key === 'Escape') {
                onClose()
            }

            // else if (event.key === 'ArrowLeft') {
            //     // handleNavPrev()
            //     console.log("RefView: handleKeyDown: ArrowLeft")
            // }
            // else if (event.key === 'ArrowRight') {
            //     // handleNavNext()
            //     console.log("RefView: handleKeyDown: ArrowRight")
            // }

        };
        window.addEventListener('keydown', handleKeyDown);

        // return value is function to call upon component close
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose]);

                // // get initial ref details to show upon component init
                // useEffect(() => {
                //     // setRefDetails(refDetails)
                //     // setSelectedRefIndex(defaultRefIndex)
                //     handleRefListClick({"action":"referenceClicked", "value": defaultRefIndex})
                // }, []);

    const handleRefListClick = React.useCallback((result) => {
        // set refDetails according to reference id
        // alert(`handleRefListClick: result: ${JSON.stringify(result)}`)

        if (!result) return

        console.log(`RefView: handleRefListClick: result = ${result.action}:${result.value}`)

        if (result.action === "referenceClicked") {  // .value holds ref index to select

            const refIndex = result.value

            // send message back up to parent component
            onAction({"action": IARE_ACTIONS.CHANGE_REF_VIEW_SELECTION.key, "value": refIndex})


            // setRefDetails(foundRef)
            // setSelectedRefIndex(refIndex)

            //
            // RefView owns selectedRefIndex state that us sent to RfFlock sub-encodeURIComponent(
            //     - set selectedRefIndex here
            //     - should be refdlected in refFlock

        }
    }, [])


    // close modal if not in open state
    if (!open) return null;

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
                        <div>Current ref index: {selectedRefIndex}</div>

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

