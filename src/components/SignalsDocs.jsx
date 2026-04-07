import React from "react";
import MakeLink from "./MakeLink.jsx";
import './css/signals.css';

export default function SignalsDocs({}) {




    return <>
        <div style={{
            // fontFamily: "Georgia, 'Times New Roman', Times, serif",
            fontSize: "1.75rem",
            paddingBottom: ".75rem",
            color: "#0097f8",
        }}>WikiSignals</div>
        <div>
            We are building the reliability infrastructure for the internet.
            We want to empower internet users with the ability to identify
            signals they can use to determine how reliable the information they
            are consuming is.
            
        </div>
        <br/>
        <div>
            WikiSignals is a system that offers reliability and credibility
            statistics for URL domains.

            By retrieving and analysing various signals from the internet,
            recommendations are produced pertaining to the reliability and
            credibility of a URL domain.
        </div>
<br/>
        <div>
            See the <MakeLink href="https://wikisignals.org/" linkText="WikiSignals"/> website for more information.
        </div>
    </>

}





