import React from "react";

function RefDataV2( { pageData, version }) {

    const refData = pageData ? pageData.references : null ;

    return  (!refData
            ? <div className="j-view-refs"><h3>No Reference Data to show</h3></div>
            : (<div className="j-view-refs">
                <div>
                    <h3>Version v2 data visualization coming soon...!</h3>
                    <pre>{JSON.stringify(pageData, null, 2)}</pre>
                </div>
            </div>)
    )

}

export default RefDataV2;
