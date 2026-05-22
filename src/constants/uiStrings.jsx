import React from "react";
import MakeLink from "../components/MakeLink";

export const UI_STRINGS = {
    wikiSignals: {
        title: "What is WikiSignals?",

        // description:
        //     "WikiSignals is a system that offers reliability and credibility statistics of URL domains. Various signalValues are retrieved from the great big world and displayed. The signalValues are then evaluated to produce basic recommendations pertaining to the reliability and credibility of a domain.",
        //
        content: (
            <>
                <div>
                    WikiSignals is a system that offers reliability and credibility
                    statistics for URL domains.
                    Various signalValues are retrieved from the internet and evaluated to
                    produce basic recommendations pertaining to the reliability and
                    credibility of a domain.
                </div>

                <div>
                    See the <MakeLink href="https://wikisignals.org/" linkText="WikiSignals"/> article for more information.
                </div>
            </>
        ),
        buttons: {
            sortWayback: "Sort By Wayback snapshots",
            sortWiki: "Sort By Wikipedia uses",
            sortReset: "Remove Sort",
        }
    },
}
