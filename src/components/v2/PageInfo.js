import React from "react";
import ArrayDisplay from "../ArrayDisplay";


export default function PageInfo({ pageData }) {

    return <div className="page-info">
        <h3>Page analyzed: <a href={pageData.pathName} target={"_blank"} rel={"noreferrer"}>{pageData.pathName}</a></h3>
        {pageData
            ? <div className={"detail-show"}>
                <p>endpoint: <a href={pageData.endpoint} target={"_blank"} rel={"noreferrer"}>{pageData.endpoint}</a></p>

                <div style={{display: "flex", flexDirection: "row"}}>

                    <ArrayDisplay arr={[
                        {'WARI JSON version': pageData.version},
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

            : <p>Nothing to display - pageData is missing.</p>}

    </div>

}