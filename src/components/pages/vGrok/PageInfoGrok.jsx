import React, {useState} from "react";
import PureJson from "../../PureJson.jsx";
import {convertToCSV, copyToClipboard} from "../../../utils/generalUtils.js";
import {ConfigContext} from "../../../contexts/ConfigContext.jsx";

function ClickButton( {buttonCaption=null, buttonText='', onClick}) {
    const buttonMarkup = buttonCaption ? buttonCaption : <span>{buttonText}</span>
    return <div className="debug-click-button" >
        <button onClick={onClick} className={'utility-button small-button'} >{buttonMarkup}</button>
    </div>
}

/* displays basic info from the original returned json for the page fetch */
export default function PageInfoGrok({ pageData, showViewOptions = false, handleViewOptionsClick }) {

    const [showDetail, setShowDetail] = useState(false);

    let myConfig = React.useContext(ConfigContext);
    myConfig = myConfig ? myConfig : {} // prevents "undefined.<param>" errors

    //
    // const handleCopyUrlArray = () => {
    //     copyToClipboard( JSON.stringify(pageData.urlArray), "URL Data" )
    // }
    //
    // const handleCopyPageData = () => {
    //     copyToClipboard( JSON.stringify(pageData), "pageData" )
    // }

    const handleCopyUrlArrayCsv = () => {
        // copyToClipboard( JSON.stringify(pageData.urlArray), "URL Data" )

        const urlData = pageData.urlArray.map( url => {
            return [
                url["url"]
            ]
        })

        // add column labels
        urlData.unshift( [
            'url',
        ] )

        copyToClipboard( convertToCSV(urlData), "Url Data" )

    }


    const buttonMoreDetails = myConfig.environment !== "env-production"
        ? <button onClick={()=>setShowDetail(!showDetail)} className={"more-button more-page-info-button"}>{ showDetail ? "less" : "more" } detail</button>
        : null

    // const linkPageSource = <a href={pageData.pathName} target={"_blank"} rel={"noreferrer"}>{pageData.pathName}</a>
    //
    // const section_type = <p>media type: {pageData.mediaType}</p>
    //
    // const section_method = <p>URL Status Check Method: {myConfig.urlStatusMethod}</p>
    //
    // const section_endpoint = <p>Page Fetch endpoint: <a href={pageData.endpoint} target={"_blank"} rel={"noreferrer"}>{pageData.endpoint}</a></p>
    //
    // const section_buttons = <>
    //     <ClickButton buttonText={"Copy UrlArray to Clipboard (JSON)"} onClick={handleCopyUrlArray} />
    //     <ClickButton buttonText={"Copy UrlArray to CSV"} onClick={handleCopyUrlArrayCsv} />
    //     <ClickButton buttonText={"Copy PageData to Clipboard (JSON)"} onClick={handleCopyPageData} />
    // </>
    //
    const section_extra = <><div>Grok Page Details here</div></>

    const linkPageSource = <a href={pageData.pathName} target={"_blank"} rel={"noreferrer"}>{pageData.pathName}</a>

    const pageInfoDetails = pageData
        ? <div className={'detail-section'}>
            <div>Grok Page Info Details</div>
            {/*{section_type}*/}
            {/*{section_endpoint}*/}
            {/*{section_method}*/}
            {/*{section_buttons}*/}
            {section_extra}
        </div>
        : <p>Nothing to display - pageData is missing.</p>


    const viewOptionsButton = <button
        className={"utility-button page-utility-button"}
        onClick={handleViewOptionsClick} >
        <span>{showViewOptions ? "Hide View Options" : "Show View Options"}</span>
    </button>



    return <div className="page-info">
        <h6 className={"page-stats-header"}>
            <div>Grokipedia Page Analyzed: {linkPageSource}
                {viewOptionsButton}
            </div>
            <div>{buttonMoreDetails}</div>
        </h6>

        {showDetail && pageInfoDetails}

    </div>

}