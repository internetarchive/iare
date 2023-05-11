import React from "react";
import MakeLink from "../../MakeLink";
import "./refView.css"
import Templates from "./Templates";
import Badges from "./Badges";

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
export default function RefView({ open, onClose, details, source }) {

    if (!open || !details) return null;

    const rawText = details ? details.wikitext : 'No raw wikitext provided' ;

    return <div className='ref-modal-overlay' onClick={onClose}>

        <div onClick={(e) => {e.stopPropagation()}}
             onMouseMove={(e) => {e.stopPropagation()}}
             onScroll={(e) => {e.stopPropagation()}}
             onScrollCapture={(e) => {e.stopPropagation()}}
             className={"ref-modal-container ref-view"}>

            <h4>Reference View</h4>

            <div className="modalRight">
                <p onClick={onClose} className="closeBtn">X Close</p>
            </div>

            <div className="container-fluid main-content">

                <div className="row header">


                    <div className="col-8">
                        <Templates templates={details.templates} />
                    </div>

                    <div className="col-4">
                        <Badges />
                    </div>

                </div>

                <div className="row footer">
                    <button className='btnPrimary'>
                        <span>Primary</span>
                    </button>
                    <button className='btnOutline'>
                        <span>Outline</span>
                    </button>
                </div>

            </div>

            <div className="content">

                <h6 style={{marginBottom:".25rem"}}>source: </h6>
                <p style={{marginTop:0}} ><MakeLink href={source} linkText={source}/></p>

                <h6>wikitext:</h6>
                <p>{rawText}</p>

                <h6>raw json:</h6>
                <pre className={"raw-detail"}>{JSON.stringify(details, null, 2)}</pre>

            </div>


        </div>
    </div>

}

