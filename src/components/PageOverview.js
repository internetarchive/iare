import React from "react";

/*

 */

function WrapComponent(props) {
    return <>
        <h3>Page Overview</h3>
        <div className={"page-overview"}>
            {props.children}
        </div>
    </>

}

export default function PageOverview({pageData, version}) {
    console.log("ShowOverview: version is: ", version);

    return <WrapComponent>
        {(() => { // we use a self-running function here to accomplish switching
            switch(version) {

                case "v1" :
                    return <div>
                        <p>Overview for V1</p>
                    </div>

                case "v2" :

                    if (!pageData) return <p>No page data to display</p>;

                    if (!pageData.reference_statistics) return <p>No page data to display (missing
                        'reference_statistics')</p>;

                    return <>
                        <div className={"reference-types"}>
                        <h4>Reference Types (will soon be filters)</h4>
                        {Object.keys(pageData.reference_statistics).map((key, i) => {
                                return <>
                                    <button key={i} onClick={() => {
                                    }} className={"button-ref-type"}>
                                        <span>{key} : {pageData.reference_statistics[key]}</span>
                                    </button>
                                </>
                            }
                        )}
                        </div>
                    </>

                default:
                    return <div>
                        <p>Unknown version: {version}</p>
                    </div>
            }

        })()}
    </WrapComponent>

}