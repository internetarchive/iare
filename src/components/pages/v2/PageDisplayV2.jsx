import React from "react";
import PageInfo from "./PageInfo.jsx";
import PageData from "./PageData.jsx";
import '../../css/page.css';
// import {ConfigContext} from "../../../contexts/ConfigContext.jsx";

export default function PageDisplayV2( { pageData, onAction }) {

    // let myConfig = React.useContext(ConfigContext)
    // myConfig = myConfig ? myConfig : {} // prevents myConfig.<undefined param> errors

    return <div className={"iari-wiki-display iare-ux-container"}>
        <div className={"iare-ux-header"}>
            <PageInfo
                pageData={pageData}
                onAction={onAction}
            />
        </div>
        <div className={"iare-ux-body"}>
            <PageData
                rawPageData={pageData}
                viewType={"urls"} // shall get this passed in somehow...params? config? localStorage eventually...
            />
        </div>
    </div>
}

