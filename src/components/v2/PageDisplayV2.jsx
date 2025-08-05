import React, {useState} from "react";
import PageInfo from "./PageInfo.jsx";
import PageData from "./PageData.jsx";
import '../shared/page.css';
import {copyToClipboard} from "../../utils/generalUtils.js";
import {ConfigContext} from "../../contexts/ConfigContext.jsx";

export default function PageDisplayV2( { pageData }) {

    let myConfig = React.useContext(ConfigContext)
    myConfig = myConfig ? myConfig : {} // prevents myConfig.<undefined param> errors

    const [showViewOptions, setShowViewOptions] = useState(myConfig.isShowViewOptions)

    const handleClick = () => {
        setShowViewOptions(prevState => !prevState)
    }

    return <div className={"iari-wiki-display iare-ux-container"}>
        <div className={"iare-ux-header"}>
            <PageInfo
                pageData={pageData}
                showViewOptions={showViewOptions}
                handleClick = {handleClick}
            />
        </div>
        <div className={"iare-ux-body"}>
            <PageData
                rawPageData={pageData}
                showViewOptions={showViewOptions}
                handleClick = {handleClick}
            />
        </div>
    </div>
}

