import React, {useEffect} from "react";
import MakeLink from "./MakeLink.jsx";
import './css/signals.css';
import imgScoreLogo from "../constants/badges/images/wikisignals.logo.v1r4.png"


export default function SignalsDocs({
    onClose,
}) {

    useEffect(() => {
            // adds "Escape Key closes modal" feature

            const handleKeyDown = (event) => {
                if (event.key === 'Escape') {
                    onClose()
                }
            };
            window.addEventListener('keydown', handleKeyDown);
            // return value is function to call upon component close; we unload event listeners here
            return () => {
                window.removeEventListener('keydown', handleKeyDown);
            };
        },
        [onClose]
    );



    return <>
        <div style={{
            // fontFamily: "Georgia, 'Times New Roman', Times, serif",
            fontSize: "1.75rem",
            paddingBottom: ".75rem",
            color: "#0097f8",
        }}><img src={imgScoreLogo} alt={"WikiSignals logo"}
            style={{"height" : "2.5rem"}}/> WikiSignals</div>
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
            credibility of URL domains.
        </div>
<br/>
        <div>
            See the <MakeLink href="https://wikisignals.org/" linkText="WikiSignals"/> website for more information.
        </div>
    </>

}





