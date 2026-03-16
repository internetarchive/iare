import React from "react";
import SignalBadges from "./SignalBadges.jsx";
import {signalBadgeRegistry} from "../constants/badges/signalBadgeRegistry.jsx";
import {isEmpty} from "../utils/generalUtils.js";
import './css/signals.css';


export default function SignalDataInlineDisplay({
                                                    urlObj = {},
                                                    onSignalClick,
                                                }) {
    /*
        Displays values of any signals represented in the signal data described in sigData
     */

    const signals = urlObj?.signal_data?.signals ?? {}
    const cacheMsg = urlObj?.signal_data?.retrieved_from_cache
        ? <div className={"signal-badges-extra-msg"} style={{ gridColumn: '1 / 2', gridRow: '1' }}>
            Data retrieved from cache</div>
        : null;

    return <>
        {cacheMsg}
        <SignalBadges signals={signals}
                      onSignalClick={onSignalClick}
        />
    </>
}

