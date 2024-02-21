import React, {useCallback, useEffect, useState} from "react";
import Draggable from 'react-draggable';
import {ConfigContext} from "../../../contexts/ConfigContext";
import {ArticleVersions} from "../../../constants/articleVersions";
import RefFlock from "../RefFlock";
import RefDetails from "../RefDetails";
import "./refView.css"


export default function RefView({ open, onClose,
                                    // refDetails,  // TODO: remove, as refDetails should be set in this component as a state
                                    pageData = {},
                                    refFilter=null,
                                    defaultRefId=0,

                                    // refView must take a filter and a default selected ref id
                                    // that filter gets passed on to RefFlock
                                    tooltipId }) {

    // eslint-disable-next-line
    const [selectedRefId, setSelectedRefId]= useState(defaultRefId)
    const [refDetails, setRefDetails]= useState(pageData.references.find(r => r.ref_id == defaultRefId))

    let myConfig = React.useContext(ConfigContext);
    myConfig = myConfig ? myConfig : {} // prevents "undefined.<param>" errors

    // adds "Escape Key closes modal" feature
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                onClose()
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose]);


    console.log("RefView: rendering")

    // close modal if not in open state
    if (!open) return null;


    const handleRefListClick = (result) => {
        // set refDetails according to reference id
        // alert(`handleRefListClick: result: ${JSON.stringify(result)}`)

        if (!result) return

        if (result.action === "referenceClicked") {

            if (pageData.iariArticleVersion === ArticleVersions.ARTICLE_V1.key) {
                // get ref details for refId (specified by value)
                const refId = result.value
                // we need to use different algorithm here...V! does not contain ref_id
                // NB TODO need to have a common index for refs...
                //  can be iare-session specific; does not need to carry over across pages por page fetches
                const foundRef = pageData.references.find(r => r.ref_id === refId)
                setRefDetails(foundRef)

            } else if (pageData.iariArticleVersion === ArticleVersions.ARTICLE_V2.key) {
                // get ref details for refId (specified by value)
                const refId = result.value
                const foundRef = pageData.references.find(r => r.ref_id == refId)  // NB Note ==, not ===
                setRefDetails(foundRef)
            }
        }
    }

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

                    {/*<div className="row no-gutters">*/}

                        <div className={"ref-view-list"}>

                            {/* show Ref Flock at left of ref view for navigation */}
                            <RefFlock pageData={pageData}
                                      refArray={pageData.references}
                                      refFilter={refFilter}
                                      onAction={handleRefListClick}
                                      selectedReferenceId={null}
                                      options={{
                                          hide_header: true,
                                          show_extra: false,
                                          show_filter_description: true
                                        }}
                                      tooltipId={"url-display-tooltip"}
                            />
                        </div>

                        <div className="ref-view-details">
                            <RefDetails
                                refDetails={refDetails}
                                pageData={pageData}
                                tooltipId={tooltipId}
                                config={myConfig} />
                        </div>

                    {/*</div>*/}

                </div>

            </div>
        </Draggable>
    </div>

}

