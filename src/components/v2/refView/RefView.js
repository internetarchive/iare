import React, {useCallback, useEffect, useState} from "react";
import "./refView.css"
import RefTemplates from "./RefTemplates";
import RefActions from "./RefActions";
// import RefUrls from "./RefUrls";
// import {copyToClipboard} from "../../../utils/utils";
import Draggable from 'react-draggable';
import RefWikitext from "./RefWikitext";
import RefActionables from "./RefActionables";
import RefArticleInfo from "./RefArticleInfo";
import RefViewRefDisplay from "./RefViewRefDisplay";
import {ConfigContext} from "../../../contexts/ConfigContext";

/*
idea details:
    templates array - show parameters in grid.
    * ? give template score based on parameters filled
        - could show templates by score - scatter? bar chart with filters? could show refs with templates of certain score range

    urls array
    -  show urls with status codes
        - peek into "new" modified, decorated url array for status code (& other info?)
    - display archive status of link
        - show IA logo and address underneath link if it is archived
            - for now, can show url's inref button itself?
    - have a score rating for url(s) array
        - sort by score and filter ref

*/


export default function RefView({ open, onClose, refDetails, pageData = {}, tooltipId }) {

    // eslint-disable-next-line
    const [wikitext, setWikitext]= useState(refDetails?.wikitext)

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

    const saveWikitext = (newText) => {
        // for now, we just set local wikitext.
        // soon we will insert/replace into reference data itself and resave the entire article (i think)
        //
        setWikitext(newText)

        // set details.wikitext OR cause a wholesale refresh of the page,
        // since things could be very much changed
                    // //
                    // // for now, just change details
                    // details.wikitext = newText
    }

    const handleRefViewAction = useCallback( (result={}) => {
        // extract action and value from result
        const {action, value} = result;

        console.log(`RefView: handleAction: action=${action}, value=${value}`);

        if (0) {}  // allows easy else if's

        else if (action === "saveWikitext") {
            // this is where we need to asynchronously save the reference/entire page, and reload, basically
            const newText = value
            saveWikitext(newText)
        }

        else if (action === "jumpToCitationRef") {
            const citeRef = value
            alert(`jumpToCitationRef: Coming Soon (citeRef=${citeRef})`)
        }

    }, [])

    console.log("RefView: rendering")

    // close modal if not in open state
    if (!open || !refDetails) return null;

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

                    <div className="row no-gutters">

                        <div className="xxx.col-9">
                            <RefViewRefDisplay _ref={refDetails} showDebug={myConfig.isShowDebugInfo} />

                            <RefTemplates templates={refDetails.templates} pageData={pageData} tooltipId={tooltipId} />
                            {/*<RefWikitext wikitext={wikitext} ref_details={details} onAction={handleRefViewAction} />*/}

                            <RefActionables actions={refDetails.actions} />
                            <RefWikitext wikitext={refDetails.wikitext} ref_details={refDetails} onAction={handleRefViewAction} />

                            <RefArticleInfo _ref={refDetails} />
                        </div>

                        {false && <div className="col-3">
                            <RefActions details={refDetails} onAction={handleRefViewAction} />
                        </div>}

                    </div>

                </div>

            </div>
        </Draggable>
    </div>

}

