import React, {useState} from "react";
import PureJson from "../utils/PureJson.jsx";
import {convertToCSV, copyToClipboard} from "../../utils/generalUtils.js";
import {ConfigContext} from "../../contexts/ConfigContext.jsx";

function ClickButton( {buttonCaption=null, buttonText='', handleClick}) {
    const buttonMarkup = buttonCaption ? buttonCaption : <span>{buttonText}</span>
    return <div className="debug-click-button" >
        <button onClick={handleClick} className={'utility-button small-button'} >{buttonMarkup}</button>
    </div>
}

/* displays basic info from the original returned json for the page fetch */
export default function PageInfo({ pageData }) {

    const [showDetail, setShowDetail] = useState(false);

    const ores_prediction = pageData && pageData.ores_score && pageData.ores_score.prediction
        ? pageData.ores_score.prediction
        : null;
    const ores_score = ores_prediction && pageData.ores_score.probability
        ? pageData.ores_score.probability[ores_prediction]
        : null;
    const ores_score_display = ores_score
        // ? `${ores_prediction} ${Number(ores_score).toLocaleString(undefined,{style: 'percent', minimumFractionDigits:0})}`
        ? `${ores_prediction}`
        : null

    let myConfig = React.useContext(ConfigContext);
    myConfig = myConfig ? myConfig : {} // prevents "undefined.<param>" errors

    const handleCopyUrlArray = () => {
        copyToClipboard( JSON.stringify(pageData.urlArray), "URL Data" )
    }

    const handleCopyPageData = () => {
        copyToClipboard( JSON.stringify(pageData), "pageData" )
    }

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


    const handleCopyCiteRefs = () => {
        // gathers cite_ref parallel ref data to try to match it up.

        const citeRefData = pageData.cite_refs.map( cr => {
            return [
                cr["ref_index"],
                cr["id"],
                cr["page_refs"].map( pr => {
                    return `[${pr.id}] ${pr.href}` }).join("+++"),
                cr["raw_data"],
            ]
        })

        // add column labels
        citeRefData.unshift( [
            'ref_index',
            'cite_id',
            'page_refs',
            'raw_data',
        ] )

        copyToClipboard( convertToCSV(citeRefData), "CiteRef Data" )
    }

    const handleCopyRefs = () => {
        // gathers reference data into CS.

        const refData = pageData.references.map( _ref => {
            return [
                _ref["ref_index"],
                _ref["name"],
                _ref["type"],
                _ref["footnote_subtype"],
                _ref["wikitext"],
            ]
        })

        // add column labels
        refData.unshift( [
            'ref_index',
            'name',
            'type',
            'subtype',
            'wikitext',
        ] )

        copyToClipboard( convertToCSV(refData), "Reference Data" )
    }

    const oresResults = ores_score_display ? <span className={"ores-display"}>ORES Score: {ores_score_display}</span> : null
    const buttonMoreDetails = myConfig.environment !== "env-production"
        ? <button onClick={()=>setShowDetail(!showDetail)} className={"more-button more-page-info-button"}>{ showDetail ? "less" : "more" } detail</button>
        : null
    const linkPageSource = <a href={pageData.pathName} target={"_blank"} rel={"noreferrer"}>{pageData.pathName}</a>

    const section_type = <p>media type: {pageData.mediaType}</p>

    const section_method = <p>URL Status Check Method: {myConfig.urlStatusMethod}</p>

    const section_version = <p>Page Parse Method: {myConfig.articleVersion}</p>

    const section_ores = ores_score_display
        ? <>
            <p style={{marginBottom:0}}>ORES Score: {ores_score_display}</p>
            <PureJson data={pageData.ores_score} caption={null} />
        </>
        : null

    const section_endpoint = <p>Page Fetch endpoint: <a href={pageData.endpoint} target={"_blank"} rel={"noreferrer"}>{pageData.endpoint}</a></p>

    const section_buttons = <>
        <ClickButton buttonText={"Copy CiteRefs to CSV"} handleClick={handleCopyCiteRefs} />
        <ClickButton buttonText={"Copy Reference Data to CSV"} handleClick={handleCopyRefs} />
        <ClickButton buttonText={"Copy UrlArray to Clipboard (JSON)"} handleClick={handleCopyUrlArray} />
        <ClickButton buttonText={"Copy UrlArray to CSV"} handleClick={handleCopyUrlArrayCsv} />
        <ClickButton buttonText={"Copy PageData to Clipboard (JSON)"} handleClick={handleCopyPageData} />
    </>

    const pageInfoDetails = pageData
        ? <div className={'detail-section'}>
        {section_type}
        {section_endpoint}
        {section_method}
        {section_version}
        {section_ores}
        {section_buttons}
        </div>
        : <p>Nothing to display - pageData is missing.</p>

    return <div className="page-info">
        <h6 className={"page-stats-header"}>
            <div>Wiki Page Analyzed: {linkPageSource}{true && oresResults}</div><div>{buttonMoreDetails}</div>
        </h6>

        {showDetail && pageInfoDetails}

    </div>

}