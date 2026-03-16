import React from "react";
import mbfcLogo from "./images/badge.logo.mbfc.small.png";

export default function MbfcBadge({
                                      signals = {},
                                      onSignalClick
                                  }
) {

    let signalContents = null

    if (!signals) {
        signalContents = <div>No Signal Data provided</div>

    } else {

        try {
            let wsMeta = null  // WikiSignalMeta
            if (signals?.meta?.ws_mbfc_cats) {
                const mbfcData = JSON.parse(signals.meta.ws_mbfc_cats.replace(/'/g, '"'))
                wsMeta = `MBFC: ${mbfcData.bias}, ${mbfcData.credibility}, reporting: ${mbfcData.reporting}`
            }

            let wsLists = null
            if (signals.ratings) {
                const subSigs = []

                if (signals.ratings["mbfc-bias"]) subSigs.push(<div
                    key="bias">MBFC Bias: {signals.ratings["mbfc-bias"]}</div>)

                if (signals.ratings["mbfc-cred"]) subSigs.push(<div
                    key="cred">MBFC Cred: {signals.ratings["mbfc-cred"]}</div>)

                if (signals.ratings["mbfc-Fact"]) subSigs.push(<div
                    key="fact">MBFC Fact: {signals.ratings["mbfc-Fact"]}</div>)

                wsLists = subSigs.length > 0 ? <div>{subSigs}</div> : null
            }

            signalContents = <div>
                {wsMeta}
                {wsLists}
            </div>

            // TODO put the extra data, like mbfcData.name, in element
            //  dataset, to be picked up by element click

        } catch (e) {
            signalContents = <div>MBFC: Error encountered ({e.message})</div>
        }
    }

    return <div className={"badge-mbfc signal-badge"}>
        <div className={"signal-badge-element badge-icon"}>
            <img src={mbfcLogo} alt="Media Bias Fact Check" className={"logo-image"}/>
        </div>
        <div className={"signal-badge-element"}>
            {signalContents}
        </div>
    </div>
}
