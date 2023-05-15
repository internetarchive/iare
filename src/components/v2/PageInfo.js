import React, {useState} from "react";
import ArrayDisplay from "../ArrayDisplay";


export default function PageInfo({ pageData }) {

    const [showDetail, setShowDetail] = useState(false);

    return <div className="page-info">
        <h6>Wiki Page Analyzed: <a href={pageData.pathName} target={"_blank"} rel={"noreferrer"}>{pageData.pathName}</a
            > <button onClick={()=>setShowDetail(!showDetail)} className={"more-button"}>{ showDetail ? "less" : "more" } details</button>
        </h6>

        {pageData
            ? <div className={ showDetail ? "detail-show" : "detail-hide" }>
                <p>endpoint: <a href={pageData.endpoint} target={"_blank"} rel={"noreferrer"}>{pageData.endpoint}</a></p>

                <p>media type: {pageData.mediaType}</p>

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