import React, {useCallback, useState} from "react";
import {ProbeDefs} from "./../../constants/probeDefs.jsx";
import {isEmpty} from "../../utils/generalUtils.js";


export default function ProbesDisplay({
        probeData = {},
        onProbeClick,
    }) {


    /*
    displays a "badge" for each probe found in probes array
    may eventually show the overall "score" of credibility of probe results

    example probeData:

    {
        score: 0,
        probes: {
            probe1: { errors: ["Unknown probe: probe1"]},
            probe2: { errors: ["Unknown probe: probe2"]},
            verifyi: {
                raw: {
                    MBFC: {
                        bias: "left-center",
                            credibility: "medium-credibility",
                            name: "The Guardian",
                            reporting: "mixed"
                    },
                    WikipediaEnglishPerennialSources: {
                        source: {
                            185: "The Guardian (TheGuardian.com, The Manchester Guardian, The Observer)",
                                186: "The Guardian blogs"
                        },
                        status: {
                            185: "Generally reliable",
                                186: "No consensus"
                        }
                    },
                    Decodex: {
                        credibility: "Generally reliable in principle"
                    }
                },
                errors: [
                    "blocklist_check not yet implemented."
                ]
    }}}

    */

    const handleProbeClick = (e) => {
        onProbeClick(e)  // pass it on up to caller parent component for now...
        // ...later we could add in some preprocessing if we had to
    }

    const probeItems = (isEmpty(probeData) || isEmpty(probeData.probes))
        ? <div>No Probe Data</div>
        : Object.keys(probeData?.probes).map( (pName, i) => {
            const pDef = ProbeDefs[pName]  // ProbeDefs is globally defied probes
            if (pDef) {
                return <div className={"probe-badge"}
                            key={pDef.key}
                            onClick={handleProbeClick}
                            data-probe-key={pDef.key}
                >{pDef.short_caption}</div>

            } else {
                // Question mark for unknown probe key
                return <div className={"probe-badge"}
                            key={`${i}-${pName}`}
                            onClick={handleProbeClick}
                            data-probe-key={`unknown-${pName}`}
                >{pName}</div>
            }
        })


    return <>
        <div className={"probe-results probe-badges probes-display"}>
            {probeItems}
        </div>
    </>


}

