import React from 'react';
import '../shared/components.css';
import RawJson from "../RawJson.jsx";

export default function StatsDisplay ({ pageData, options } ) {

    return <>
        <div className={"stats-display section-box"}>

            {true && <h3>Statistics</h3>}

        </div>

        <div className={"section-box"}>
            <h3>Stats shall go here</h3>
            <div>Things like LAMP and IABot stats</div>
        </div>

        <RawJson obj={pageData} />

    </>
}
