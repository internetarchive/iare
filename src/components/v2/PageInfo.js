import React from "react";
import ArrayDisplay from "../ArrayDisplay";

/*

 */


export default function PageInfo({pageData}) {

    return <div className="page-info">
        <h3>Page Info</h3>
        {pageData
            ? <>

                <p>endpoint: <a href={pageData.fileName} target={"_blank"} rel={"noreferrer"}>{pageData.fileName}</a></p>

                <div style={{display: "flex", flexDirection: "row"}}>

                    <ArrayDisplay arr={[
                        {'WARI Json version': pageData.version},
                        {'lang': pageData.lang},
                        {'site': pageData.site},
                        {'title': pageData.title},
                    ]}/>

                    <ArrayDisplay arr={[
                        {'wari_id': pageData.wari_id},
                        {'page id': pageData.page_id},

                        {'timestamp': new Date(pageData.timestamp * 1000).toString()}, // times 1000 b/c of milliseconds
                        {'timing': pageData["timing"]},

                    ]} styleObj={{marginLeft: "1em"}}/>
                </div>
            </>

            : <p>Nothing to display - pageData is missing.</p>}

    </div>

}