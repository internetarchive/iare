import React from "react";
import ArrayDisplay from "../ArrayDisplay";

/*

 */


export default function PageInfo({pageData}) {

    return <div className="page-info">
            <h3>Page Info</h3>
            { pageData ? <ArrayDisplay arr = {[

                    {'endpoint' : pageData.fileName },
                    {'WARI Json version' : pageData.version },

                    {'lang': pageData.lang},
                    {'site' : pageData.site },
                    {'title' : pageData.title },

                    {'wari_id' : pageData.wari_id },
                    {'page id': pageData.page_id},

                    {'timestamp': new Date(pageData.timestamp * 1000).toString()}, // times 1000 b/c of milliseconds
                    {'timing': pageData["timing"]},

                ]} styleObj={{marginBottom: "1em"}} />

                : <p>Nothing to display - pageData is missing.</p> }
        </div>

}