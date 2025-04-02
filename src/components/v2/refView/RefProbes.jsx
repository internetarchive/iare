import React, {useState} from "react";
import {ProbeMethods as Probes} from "../../../constants/probeMethods.jsx";
import CitationDisplayInfo from "../citations/CitationDisplayInfo.jsx";
import RefSectionHeader from "./RefSectionHeader.jsx";
import {Button} from "react-bootstrap";
import ResizablePopup from "../../ResizablePopup.jsx";


/*
shows as much info for reference in as pleasant display as possible
 */
export default function RefProbes({ reference,
                                       index=0,
                                       pageData= {},
                                       onClick,
                                       onAction,
                                       options = {},
                                       showDebug=false }) {

    const [isProbeOpen, setIsProbeOpen] = useState(false)
    const [modalData, setModalData] = useState('Initial data');

    if (!reference) return null;


    const header = <RefSectionHeader
        leftPart={<h3>Truth Probe Results</h3>}
        // rightPart={buttonCopy}
    >
        {/* nothing to see here */}
        {/*<div>Something to see...</div>*/}
    </RefSectionHeader>

    const showProbeResults = (probeKey) => {
        // alert(`show probe for ${probeKey}`)

        setModalData(<p>probe data for {probeKey} at {new Date().toLocaleTimeString()}</p>)
        setIsProbeOpen(true)

    }

    // // get all probe results
    const probes = [ Probes.PROBE_VERIFYI.key, Probes.PROBE_TRUST.key, ]
    // const probeResults = iariUtils.getProbeResults(reference.urls, probes)

    // display in an array
    const probeDisplay = probes.map( pKey => {
        return <Button
            className={"btn truth-probe-button xutility-button xsmall-button"}
            key={pKey}
            onClick={() => showProbeResults(pKey)}
        ><span>Results for {`${Probes[pKey].name}`}</span>
        </Button>
        // return <button key={pKey} className={"ref-button"}><span>Results for {`${Probes[pKey].name}`}</span></button>
    })

    return <>
        <div className="ref-view-section probe-info">
            <div className="col-12">
                {header}
                <div className={'ref-view-probe'}>
                    {probeDisplay}
                </div>
            </div>
        </div>

        <ResizablePopup isOpen={isProbeOpen}
                        onClose={() => {
                            setIsProbeOpen(false)
                        }}>
            {modalData}
            <p>some stuff here</p>
            <p>some more stuff here</p>
            <p>some more stuff here</p>
        </ResizablePopup>
    </>

}

