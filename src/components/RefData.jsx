import React from "react";
import RefDataV1 from './v1/RefDataV1.js';
import RefDataV2 from './v2/RefDataV2.js';


export default function RefData( { pageData, version }) {

    let refInfo = null;
    switch(version) {
        case "v1" :
            refInfo = <RefDataV1 pageData={pageData}  />
            break;

        case "v2" :
            refInfo = <RefDataV2 pageData={pageData}  />
            break;

        default:
    }

    return refInfo
}

