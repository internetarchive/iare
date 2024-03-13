import React, {useState} from "react";
import ArrayDisplay from "../ArrayDisplay";
import PureJson from "../utils/PureJson";
import {convertToCSV, copyToClipboard} from "../../utils/utils";
import {ConfigContext} from "../../contexts/ConfigContext";
// import {UrlStatusCheckMethods} from "../../constants/checkMethods";

function ClickButton( {buttonCaption=null, buttonText='', handleClick}) {
    const buttonMarkup = buttonCaption ? buttonCaption : <span>{buttonText}</span>
    return <div style={{marginBottom: "1rem"}}>
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

    const pageInfoDetails = pageData ? <div className={'detail-section'}>

        <p>media type: {pageData.mediaType}</p>

        <p>Check Method: {myConfig.urlStatusMethod}</p>

        <p>Article Version: {myConfig.articleVersion}</p>

        {ores_score_display
            ? <>
                <p style={{marginBottom:0}}>ORES Score: {ores_score_display}</p>
                <PureJson data={pageData.ores_score} caption={null} />
            </>
            : null
        }

        <p>endpoint: <a href={pageData.endpoint} target={"_blank"} rel={"noreferrer"}>{pageData.endpoint}</a></p>

        <ClickButton buttonText={"Copy CiteRefs to CSV"} handleClick={handleCopyCiteRefs} />
        <ClickButton buttonText={"Copy Reference Data to CSV"} handleClick={handleCopyRefs} />
        <ClickButton buttonText={"Copy UrlArray to Clipboard (JSON)"} handleClick={handleCopyUrlArray} />
        <ClickButton buttonText={"Copy UrlArray to CSV"} handleClick={handleCopyUrlArrayCsv} />
        <ClickButton buttonText={"Copy PageData to Clipboard (JSON)"} handleClick={handleCopyPageData} />

        <div className={"page-details-table"} style={{display: "flex", flexDirection: "row"}}>

            <ArrayDisplay arr={[
                {'IARI JSON version': pageData.version},
                {'lang': pageData.lang},
                {'site': pageData.site},
                {'title': pageData.title},
            ]}/>

            <ArrayDisplay arr={[
                {'wari_id': pageData.wari_id},
                {'page id': pageData.page_id},

                {'timestamp': pageData.timestamp ? new Date(pageData.timestamp * 1000).toString() : ""}, // times 1000 b/c of milliseconds
                {'timing': pageData["timing"]},

            ]} styleObj={{marginLeft: "1em"}}/>
        </div>

    </div>
        : <p>Nothing to display - pageData is missing.</p>

    return <div className="page-info">
        <h6 className={"page-stats-header"}>
            <div>Wiki Page Analyzed: {linkPageSource}{true && oresResults}</div><div>{buttonMoreDetails}</div>
        </h6>

        {showDetail && pageInfoDetails}

    </div>

}