import React from "react";
import SignalBadge from "./SignalBadge.jsx";


export default function SignalBadges({
                                         signals={},  // signals from url
                                         activeSignalKeys = [],  // list of signals to include
                                         options = {},
                                         onSignalClick,  // what to do if signal clicked
                                    }) {

    // for each signal in url's signals dict, display as prescribed by signal badge
    const signalBadgesDisplay = activeSignalKeys.map((signalKey, i) => {
        return <SignalBadge signalKey={signalKey} signals={signals} key={i} onSignalClick={onSignalClick}/>
    })

    return <>
        <div className={"signals-badges"}>
            {signalBadgesDisplay}
        </div>
    </>


}

