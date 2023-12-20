import React, {useCallback, useEffect} from "react";
import MakeLink from "../../MakeLink";
import "./refView.css"
import RefTemplates from "./RefTemplates";
import RefActions from "./RefActions";
import RefStats from "./RefStats";
import RefUrls from "./RefUrls";
import {copyToClipboard} from "../../../utils/utils";
import Draggable from 'react-draggable';

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

function RefViewHeader({ details, onClose }) {
    return  <div className="row header no-gutters ref-view-header">

        <div className="col-9">
            <div className={"row"}>

                <div className="col-6 no-padding">
                    <h2 className={`text-primary ${details?.test_data ? 'test-display' : ''}`}
                    >Reference View{details?.test_data ? " (test reference viewer)" : ''}</h2>
                </div>

                <div className="col-6 text-end"><span
                    className={"ref-origin-link"}> archive.org reference id: {
                    details.endpoint
                        ? <MakeLink href={details.endpoint} linkText={details.id}/>
                        : ''
                }</span>
                </div>
            </div>
        </div>

        <div className="col-3">

            <div className="modalRight">
                <p onClick={onClose} className="closeBtn">X Close</p>
            </div>
        </div>

    </div>
}

function RefViewFooter({ details }) {
    const rawText = details ? details.wikitext : 'No raw wikitext provided'

    const copyClip = <span>
        <button onClick={() => {copyToClipboard(rawText, 'wikitext')} }
                className={'utility-button'}
                style={{position: "relative", top: "0"}}
        ><span>Copy to clipboard</span></button></span>

    return <div className="row ref-view-footer">
        <div className="col-12">
            <h4>wikitext:{false && copyClip}</h4>
            <p className={"raw-wikitext"}>{rawText}</p>
        </div>
        {/*<div className="col-4">*/}
        {/*    <h4>raw json:</h4>*/}
        {/*    <pre className={"raw-json-detail"}>{JSON.stringify(details, null, 2)}</pre>*/}
        {/*</div>*/}
    </div>
}

export default function RefView({ open, onClose, details }) {

    // add "Escape Key closes modal" feature
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

    const handleRefViewAction = useCallback( (result={}) => {
        // extract action and value from result
        const {action, value} = result;

        console.log(`RefView: handleAction: action=${action}, value=${value}`);

        if (action === "refreshUrlStatus") {
            alert("Refreshing Url Status (not really...)")
            //fetchData()???
        }

        if (action === "jumpToCitationRef") {
            const citeRef = value
            alert(`jumpToCitationRef: Coming Soon (citeRef=${citeRef})`)
        }

    }, [])

                // const onClickLinkStatus = (e) => {
                //     // "jump" to selected linkStatus (which is a template, or an exotemplate url
                //
                //     // TODO: we need a sub-citation item id here, which will refer to an item that contains URLs
                //
                //     // const linkStatus = e.target.dataset['linkStatus']
                //     console.log("will jump to section containing this link")
                // }


    // close modal if not in open state
    if (!open || !details) return null;

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

                <div className="ref-view-title-bar" />

                <div className="ref-view-contents">

                    <RefViewHeader details={details} onClose={onClose}/>

                    <div className="row no-gutters">

                        <div className="xxx.col-9">
                            <div className={'ref-view-content'}>
                                <RefTemplates templates={details.templates} />
                                <RefUrls urls={details.urls} />
                                {/*<RefLinkStatus linkStatus={details.link_status} />*/}
                            </div>
                            <RefViewFooter details={details} />
                        </div>

                        {false && <div className="col-3">
                            <RefActions details={details} onAction={handleRefViewAction} />
                            <RefStats details={details} />
                        </div>}

                    </div>

                </div>

            </div>
        </Draggable>
    </div>

}

