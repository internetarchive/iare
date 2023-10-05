import React from "react";
// import ai_img from '../../../images/ai_this.v2r1.redblack.png';

export default function RefActions( {options, onAction}) {

    const handleJumpToCitation = (e) => {
        const mainTarget = e.target.closest('.btn')
        const myCiteRef = mainTarget.dataset['citeRef']
        onAction({action:'jumpToCitationRef', value:myCiteRef})
    }

    const myCiteRef = options?.citeRef || 0

    return <div className="row ref-view-actions">
        <div className={"col-12"}><h3>Actions</h3>

            {/*<button type="button" className="btn btn-primary" data-cite-ref={options?.cite_ref} onClick={handleJumpToCitation}>*/}
            {/*    <span>Jump to<br/>Article<br/>Citation</span>*/}
            {/*</button>*/}
            <button type="button" className="btn btn-primary" data-cite-ref={myCiteRef} onClick={handleJumpToCitation}>
                <span>Jump to<br/>Article<br/>Citation</span>
            </button>

            <p className={"ref-note-alert"}>Coming soon...</p>

            <button type="button" className="btn btn-primary" onClick={() => {alert("Will Jump to IABot Management Page (coming soon...)")}}>
                <span>Jump to<br/>IABot<br/>Management</span>
            </button>

            <p className={"ref-note-alert"}>Coming soon...</p>

            {/*<button type="button" className="btn btn-primary">*/}
            {/*    <span>Suggest Changes</span>*/}
            {/*</button>*/}

            {/*<button type="button" className="btn btn-primary">*/}
            {/*    <span>Save Changes</span>*/}
            {/*</button>*/}

            {/*<img src={ai_img} className="big-button" style={{width: "100%"}} alt="ai this"/>*/}

        </div>
    </div>
}

