import React from "react";
import MakeLink from "../../MakeLink";
import "./refView.css"
import RefTemplates from "./RefTemplates";
import RefActions from "./RefActions";
import RefStats from "./RefStats";

/*
details:
    templates array - show parameters in grid.
    * ? give template score based on parameters filled
        - could show templates by score - scatter? bar chart with filters? could show refs with templates of certain score range

    urls array
    -  show urls with status codes
        - peek into "new" modified, decorated url array for status code (& other info?)
    - display archive status of link
        - show IA logo and address underneath link if it is archived
            - for now, can show url's inref button itself?
    - have a score ratig for url(s) array
        - sort by score and filter ref


 */
export default function RefView({ open, onClose, details }) {

    if (!open || !details) return null;

    const rawText = details ? details.wikitext : 'No raw wikitext provided' ;

    return <div className='ref-modal-overlay' onClick={onClose}>

        <div onClick={(e) => {e.stopPropagation()}}
             onMouseMove={(e) => {e.stopPropagation()}}
             onScroll={(e) => {e.stopPropagation()}}
             onScrollCapture={(e) => {e.stopPropagation()}}
             className={"ref-modal-container ref-view"}>


            <div className="main-content">

                <div className="row header no-gutters">

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

                <div className="row xxxheader no-gutters">

                    <div className="col-9">
                        <RefTemplates templates={details.templates} />

                        <div className="row ref-raw-data">
                            <div className="col-8">
                                <h4>wikitext:</h4>
                                <p className={"raw-wikitext"}>{rawText}</p>
                            </div>
                            <div className="col-4">
                                <h4>raw json:</h4>
                                <pre className={"raw-json-detail"}>{JSON.stringify(details, null, 2)}</pre>
                            </div>
                        </div>

                    </div>

                    <div className="col-3">
                        <RefActions />
                        <RefStats />
                    </div>

                </div>

                {/*<div className="row footer"><p>footer</p>*/}
                {/*</div>*/}

            </div>

        </div>
    </div>

}

