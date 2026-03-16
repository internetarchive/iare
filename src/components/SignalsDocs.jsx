import React from "react";
import MakeLink from "./MakeLink.jsx";
import './css/signals.css';

export default function SignalsDocs({}) {

    return <>
        <div>
            WikiSignals is a system that offers reliability and credibility
            statistics for URL domains.
        </div>
        <br/>
        <div>
            Various signals are retrieved from the internet and evaluated to
            produce basic recommendations pertaining to the reliability and
            credibility of a domain.
        </div>
<br/>
        <div>
            See the <MakeLink href="https://wikisignals.org/" linkText="WikiSignals"/> website for more information.
        </div>
    </>

}





