import React, {useState} from "react";
import '../../css/page.css';
import {ConfigContext} from "../../../contexts/ConfigContext.jsx";
import PageInfoGrok from "./PageInfoGrok.jsx";
import PageDataGrok from "./PageDataGrok.jsx";

export default function PageDisplayGrok( { pageData }) {

    let myConfig = React.useContext(ConfigContext)
    myConfig = myConfig ? myConfig : {} // prevents myConfig.<undefined param> errors

    const [showViewOptions, setShowViewOptions] = useState(myConfig.isShowViewOptions)

    const handleViewOptionsClick = () => {
        setShowViewOptions(prevState => !prevState)
    }

    return <div className={"iari-wiki-display iare-ux-container"}>
        <div className={"iare-ux-header"}>
            <PageInfoGrok
                pageData={pageData}
                showViewOptions={showViewOptions}
                handleViewOptionsClick = {handleViewOptionsClick}
            />
        </div>
        <div className={"iare-ux-body"}>
            <PageDataGrok
                rawPageData={pageData}
                showViewOptions={showViewOptions}
                viewType={"urls"} // shall get this passed in somehow...params? config? localStorage eventually...
            />
        </div>
    </div>
}
