import React from "react";
// import ai_img from '../../../images/ai_this.v2r1.redblack.png';

export default function RefActions( {details, onAction}) {

    const handleJumpToCitation = (e) => {
        const mainTarget = e.target.closest('.btn')
        const myCiteRef = mainTarget.dataset['citeRef']
        // onAction({action:'jumpToCitationRef', value:myCiteRef})
        const wikiBaseUrl = "https://en.wikipedia.org/wiki/"
        const resolvedCiteRef = myCiteRef.replace( /^\.\//, wikiBaseUrl)
        window.open(resolvedCiteRef, "_blank")
    }

    const citeRefLinks = details.cite_refs
        ? details.cite_refs.map( cr => {
            return <>
                <button type="button" className="btn btn-primary" data-cite-ref={cr.href} onClick={handleJumpToCitation}>
                    <span>Jump to<br/>Article Citation</span>
                </button>
            </>
        })
        // : <div style={{fontStyle:"italic"}}>Shall jump to Citation<br/>&lt;Error: jumps broken&gt;</div>
        : <button className={"btn btn-outline-danger btn-sm"} disabled style={{fontStyle:"italic"}}>Shall jump to Citation<br/>&lt;Error: jumps broken&gt;</button>


    return <div className="row ref-view-actions">

        <div className={"col-12"}><h3>Actions</h3>

            {citeRefLinks}

            {/*<p className={"ref-note-alert"}>Under development...<br/>(may not jump to correct location)</p>*/}

            {/*<button type="button" className="btn btn-primary" onClick={() => {alert("Will Jump to IABot Management Page (coming soon...)")}}>*/}
            {/*    <span>Jump to<br/>IABot<br/>Management</span>*/}
            {/*</button>*/}

            {/*<p className={"ref-note-alert"}>Coming soon...</p>*/}

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

