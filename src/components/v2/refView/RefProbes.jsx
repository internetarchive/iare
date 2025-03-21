import React from "react";
import {ProbeMethods as Probes} from "../../../constants/probeMethods.jsx";
import CitationDisplayInfo from "../citations/CitationDisplayInfo.jsx";
import RefSectionHeader from "./RefSectionHeader.jsx";
import {Button} from "react-bootstrap";


/*
shows as much info for reference in as pleasant display as possible
 */
export default function RefProbes({ reference,
                                       index=0,
                                       pageData= {},
                                       probeMethod="",
                                       onClick,
                                       onAction,
                                       options = {},
                                       showDebug=false }) {

    if (!reference) return null;

    if (probeMethod === Probes.PROBE_VERIFYI.key) {
    }

    else {
    }

    const header = <RefSectionHeader
        leftPart={<h3>Truth Probe Results</h3>}
        // rightPart={buttonCopy}
    >
        {/* nothing to see here */}
        {/*<div>Something to see...</div>*/}
    </RefSectionHeader>

    // // get all probe results
    const probes = [ Probes.PROBE_VERIFYI.key, Probes.PROBE_TRUST.key, ]
    // const probeResults = iariUtils.getProbeResults(reference.urls, probes)

    // display in an array
    const probeDisplay = probes.map( pKey => {
        return <Button className={"truth-probe-button btn utility-button small-button"} key={pKey}><span>Results for {`${Probes[pKey].name}`}</span></Button>
        // return <button key={pKey} className={"ref-button"}><span>Results for {`${Probes[pKey].name}`}</span></button>
    })

    return <div className="ref-view-section probe-info">
        <div className="col-12">
            {header}
            <div className={'ref-view-probe'}>
                {probeDisplay}
            </div>
        </div>
    </div>

}

