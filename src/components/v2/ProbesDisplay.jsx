import React from "react";
import {ProbeDefs} from "./../../constants/probeDefs.jsx";
import {isEmpty} from "../../utils/generalUtils.js";


export default function ProbesDisplay({
        urlObj={},
        // probeData = {},
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

    const probeData = urlObj?.probe_results

    const probeBadges = (isEmpty(probeData?.probes))
        ? <div className={"lolite"}>N/A</div>

        : Object.keys(probeData?.probes).map( (probeName, i) => {
            const probeDef = ProbeDefs[probeName]  // ProbeDefs is global probe definitions
            if (probeDef) {

                // get class based on score
                const probe = probeData.probes[probeName]
                const score = probe["score"]
                let badgeClass = ""
                if (score === null) {
                    badgeClass = "probe-null"
                } else if (score > 0) {
                    badgeClass = "probe-good"
                } else if (score < 0) {
                    badgeClass = "probe-bad"
                } else {
                    badgeClass = "probe-zero"
                }

                // display badge for this Probe

                return <div className={`probe-badge ${badgeClass}`}
                            key={probeDef.key}
                            onClick={onProbeClick}
                            data-probe-key={probeDef.key}
                            data-probe-score={score}
                >{probeDef.short_caption}</div>

            } else {
                // Display as Question Mark for unknown probeName
                return <div className={"probe-badge"}
                            key={`${i}-${probeName}`}
                            onClick={onProbeClick}
                            data-probe-key={`unknown-${probeName}`}
                >{probeName}</div>
            }
        })


    return <>
        <div className={"probe-results probe-badges probes-display"}>
            {probeBadges}
        </div>
    </>


}

