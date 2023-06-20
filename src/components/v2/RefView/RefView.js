import React, {useCallback} from "react";
import MakeLink from "../../MakeLink";
import "./refView.css"
import RefTemplates from "./RefTemplates";
import RefActions from "./RefActions";
import RefStats from "./RefStats";
import RefUrls from "./RefUrls";

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
    return  <div className="row header no-gutters">

        <div className="col-9">
            <div className={"row"}>

                <div className="col-6">
                    <h2 className={`text-primary ref-view-header ${details.test_data ? 'test-display' : ''}`}
                    >Reference View{details.test_data ? " (test reference viewer)" : ''}</h2>
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
    const rawText = details ? details.wikitext : 'No raw wikitext provided' ;

    return <div className="row ref-view-footer">
        <div className="col-8">
            <h4>wikitext:</h4>
            <p className={"raw-wikitext"}>{rawText}</p>
        </div>
        <div className="col-4">
            <h4>raw json:</h4>
            <pre className={"raw-json-detail"}>{JSON.stringify(details, null, 2)}</pre>
        </div>
    </div>
}

export default function RefView({ open, onClose, details }) {

    const handleRefViewAction = useCallback( (result={}) => {
            const {action, value} = result;

            console.log(`RefView: handleAction: action=${action}, value=${value}`);

            if (action === "refreshUrlStatus") {
                alert("Refreshing Url Status")
                //fetchData()

            }
        }, [])


    // close modal if not in open state
    if (!open || !details) return null;


    return <div className='ref-modal-overlay' onClick={onClose}>

        <div onClick={(e) => {e.stopPropagation()}}
             onMouseMove={(e) => {e.stopPropagation()}}
             onScroll={(e) => {e.stopPropagation()}}
             onScrollCapture={(e) => {e.stopPropagation()}}
             className={"ref-modal-container ref-view"}>

            <div>

                <RefViewHeader details={details} onClose={onClose}/>

                <div className="row no-gutters">

                    <div className="col-9">
                        <div className={'ref-view-content'}>
                            <RefTemplates templates={details.templates} />
                            <RefUrls urls={details.urls} />
                        </div>
                        <RefViewFooter details={details} />
                    </div>

                    <div className="col-3">
                        <RefActions onAction={handleRefViewAction} />
                        <RefStats />
                    </div>

                </div>

            </div>

        </div>
    </div>

}

