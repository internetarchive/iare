import React, {useCallback, useState} from "react";
import {ProbeDefs} from "./../../constants/probeDefs.jsx";


export default function ProbesDisplay(
    {
        probeData = {},
        onClick,
    }
    ) {

    // displays an occurrence for each probe found in probes array


    const handleProbeClick = (e) => {
        onClick(e)  // just pass it on up for now...
        // ...later we could add in some preprocessing if we had to
    }

    /*
    u.probes is:
    null,
    something, or
    nothing (empty array)

    if null, no data was yet fetched, so provide a button to do so
    */

    // show contents of probes, including case of no probes

    /*
    probes: {
                "verifyi" : {
                    message: "Somewhat Reliable",
                    level: 5,
                    results: {
                        thing_1: "Some things were good.",
                        thing_2: "Some things were bad"
                    }
                },
                "trust_project" : {
                    message: "Somewhat Un-reliable",
                    level: -5,
                    results: {
                        thing_1: "Some things were good.",
                        thing_2: "More things were bad"
                    }
                },
            }

    looks more like this:
    looks more like this:
    looks more like this:

    x: {
        error: "Unknown probe: x"
    },
    y: {
        error: "Unknown probe: y"
    },
    verifyi: {
        MBFC: {
            bias: "fake-news",
                credibility: "low-credibility",
                name: "Breitbart",
                reporting: "mixed"
        },
        WikipediaEnglishPerennialSources: {
            source: {
                59: "Breitbart News"
            },
            status: {
                59: "Blacklisted"
            }
        },
        Decodex: {
            credibility: "Questionable reliability"
        },
        errors: [
            "blocklist_check not yet implemented."
        ]
    },
    trust: {
        error: "Unknown probe: trust"
    }
},



     */


    const isEmpty = (o) => {
        // return true if null or undefined, empty object (no keys) or empty array
        if (o === null || o === undefined) return true
        if (typeof o === 'object' && Object.keys(o).length === 0) return true
        if (Array.isArray(o) && o.length === 0) return true
        return false
    }

    // return nada if no probes set
    if (isEmpty(probeData)) {
        return <div>No Probes</div>
    }

    // else return map of keyed items
    return <>
        <div className={"probe-results probe-badges probes-display"}>
            {Object.keys(probeData).map( (pName, i) => {
                const pDef = ProbeDefs[pName]

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
                    >?</div>
                }
            })}
        </div>
    </>


}

