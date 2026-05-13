import React from "react";
import SignalBadges from "./SignalBadges.jsx";
import './css/signals.css';

import {BadgeContexts} from "../constants/badgeContexts.jsx";

export default function SignalDisplay({
                                                    urlObj = {},
                                                    onAction,
                                                    badgeContext = BadgeContexts.inline.value,
                                                    tooltipId = null,

                                                }) {
    /*
        Displays values of any signals represented in the signal data described in sigData.
        Props:
          - urlObj: Object containing signal data.
          - onBadgeClick: Callback triggered upon signal click.
          - displayType: Enum-like property with possible values "inline", "small", or "large". Default is "inline".
     */

    const signals = urlObj?.signal_data?.signals ?? {}

    // TODO make cache message different based on badgeContextKey

    // const cacheMsg = urlObj?.signal_data?.retrieved_from_cache
    //     ? <div className={"signal-badges-extra-msg"} style={{ gridColumn: '1 / 2', gridRow: '1' }}>
    //         Data retrieved from cache</div>
    //     : null;
    //
    return <>
        {/*{cacheMsg}*/}
        <SignalBadges signals={signals}
                      onAction={onAction}
                      badgeContextKey={badgeContext}
                      tooltipId = {tooltipId}
                      fromCache = {urlObj?.signal_data?.retrieved_from_cache}
        />
    </>
}

