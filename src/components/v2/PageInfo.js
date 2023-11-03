import React, {useState} from "react";
import ArrayDisplay from "../ArrayDisplay";
import PureJson from "../utils/PureJson";
import {convertToCSV, copyToClipboard} from "../../utils/utils";

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
        ? `${ores_prediction} ${Number(ores_score).toLocaleString(undefined,{style: 'percent', minimumFractionDigits:0})}`
        : null

    const handleCopyUrlArray = () => {
        copyToClipboard( JSON.stringify(pageData.urlArray), "URL Data" )
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



    return <div className="page-info">
        <h6>Wiki Page Analyzed: <a href={pageData.pathName} target={"_blank"} rel={"noreferrer"}>{pageData.pathName}</a
        > {ores_score_display ? false && <span className={"ores-display"}>ORES Score: {ores_score_display}</span> : null}
            <button onClick={()=>setShowDetail(!showDetail)} className={"more-button"}>{ showDetail ? "less" : "more" } details</button>
        </h6>

        {pageData
            ? <div className={'detail-section' + (showDetail ? ' detail-show' : ' detail-hide') }>

                <p>media type: {pageData.mediaType}</p>

                {ores_score_display
                    ? <>
                        <p style={{marginBottom:0}}>ORES Score: {ores_score_display}</p>
                        <PureJson data={pageData.ores_score} caption={null} />
                    </>
                    : null
                }

                <p>endpoint: <a href={pageData.endpoint} target={"_blank"} rel={"noreferrer"}>{pageData.endpoint}</a></p>

                <ClickButton buttonText={"Copy CiteRefs to Clipboard"} handleClick={handleCopyCiteRefs} />
                <ClickButton buttonText={"Copy UrlArray to Clipboard"} handleClick={handleCopyUrlArray} />

                <div style={{display: "flex", flexDirection: "row"}}>

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
        }

    </div>

}