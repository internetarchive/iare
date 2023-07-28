import React, {useState} from "react";
import ArrayDisplay from "../ArrayDisplay";
import PureJson from "../utils/PureJson";


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

    return <div className="page-info">
        <h6>Wiki Page Analyzed: <a href={pageData.pathName} target={"_blank"} rel={"noreferrer"}>{pageData.pathName}</a
        > {ores_score_display ? <span className={"ores-display"}>ORES score: {ores_score_display}</span> : null}
            <button onClick={()=>setShowDetail(!showDetail)} className={"more-button"}>{ showDetail ? "less" : "more" } details</button>
        </h6>

        {pageData
            ? <div className={ showDetail ? "detail-show" : "detail-hide" }>

                <p>media type: {pageData.mediaType}</p>

                {ores_score_display
                    ? <>
                        <p style={{marginBottom:0}}>ORES score: {ores_score_display}</p>
                        <PureJson data={pageData.ores_score} caption={null} />
                    </>
                    : null
                }

                <p>endpoint: <a href={pageData.endpoint} target={"_blank"} rel={"noreferrer"}>{pageData.endpoint}</a></p>

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