import React, {useCallback, useState} from "react";
// import {Button} from "react-bootstrap";
// import Popup from "../../Popup.jsx";
// import Loader from "../../Loader.jsx";

// import {getProbeEndpoint} from "../../../utils/iariUtils.js";

import {ConfigContext} from "../../../../contexts/ConfigContext.jsx";
import loaderImage from "../../../../images/threedots.gif";
import ProbesDisplay from "../ProbesDisplay.jsx";
// import {setUrlProbeResults} from "../../utils/urlUtils.jsx";
// import Loader from "../../Loader.jsx";

const probesToLoad = "verifyi|trust_project"  // for now...shall be defined higher up in a configgy way


// shows "loading" icon
const ProbeLoader = ({startTime, message}) => {
    console.log("ProbeLoader: ", message)
    return <div style={{display:"block", margin:"0 auto"}}>
            <img src={loaderImage} alt={'Loading'}
                 style={{ margin:'auto', display:'block' }}
            />
        </div>

}


/*
probeData is a state property that contains probe results of the urlObj

            `if urlObj.probes is null, we interpret to mean no data has yet been set...show a "fetch" button
            - while fetching probe info, ProbeLoading icon is active
            - when fetch action returns, ProbesDisplay is active
`
when urlObj.probes is not null
- should be an array of probe objects/dicts (including empty array possibility)
- display contents of urlObj.probes with <ProbesDisplay>
    - takes an onProbeClick, which will display a popup with details for clicked probe

- show refresh/refetch button to refresh data

                    -
                    url.probe is set:
                    - display info
                    3 things this does:
                    - keep track of probe state:
                    - nodata, which means more data fetchable, so show "Fetch" buttin
                    - fetching - "fetch" was clicked and is now waiting for return
                    - fetched - data from fetch process is returned and can be/is interpreted as display

                    null: nodata
                    true: is loading, is fetching, waiting for return
                    false: is NOT loading - data should be valid
*/

export default function RefUrlProbe(
    {
        urlObj= {},
        pageData = {},  // FIXME may not need this so may delete
        onProbeClick,  // function call when little probe icon clicked
    }) {

    let myConfig = React.useContext(ConfigContext)
    myConfig = myConfig ? myConfig : {} // prevents undefined myConfig.<param> errors

    const [isLoading, setIsLoading] = useState(false)
    // const [probeData, setProbeData] = useState(urlObj.probe_results)

    // const fetchProbeData = useCallback((
    //     {
    //         url = '',
    //         refresh = false
    //     }) => {
    //
    //     const processProbeResults = (probeResults) => {
    //         setUrlProbeResults(urlObj, probeResults)  // set in url data
    //         setProbeData(urlObj.probe_results)  // set probeData for component display
    //     }
    //
    //     // fetch article reference data
    //     //
    //     // TODO: account for error conditions, like wrong file format, not found, etc
    //
    //     // handle null pathName
    //     if (!url) {
    //         console.log("RefUrlProbe::fetchProbeData: url is falsey.");
    //         setProbeData(null);
    //         return;
    //     }
    //
    //     const myEndpoint = getProbeEndpoint( {
    //         url: url,
    //         probes: probesToLoad,  // which probes to search for
    //         iariSourceId: myConfig.iariSourceId,
    //         refresh: refresh
    //     })
    //
    //     console.log("RefUrlProbe::fetchProbeData: url is: ", url)
    //     console.log("RefUrlProbe::fetchProbeData: endpoint is: ", myEndpoint)
    //
    //     setIsLoading(true);
    //
    //     // fetch the probe data for the url
    //     fetch(myEndpoint, {})
    //
    //         .then((res) => {
    //             if (!res.ok) {  // error if response problem
    //                 throw new Error(res.statusText ? res.statusText : res.status);
    //             }
    //             return res.json()  // pass json data to next step
    //         })
    //
    //         .then((data) => {
    //             processProbeResults( data["probe_results"] )  // sets probe results for data and display
    //         })
    //
    //         .catch((err) => {
    //             // TODO: set fake probeData for display?
    //
    //             if (false) {
    //                 // placeholder condition to easily allow insertion of other conditions
    //
    //                 // } else if (other condition) {
    //                     // some error possibilities:
    //                     // err.name === "404"
    //                     // err.name === "TypeError"
    //                     // err.message === "Failed to fetch"
    //                 // }
    //
    //             } else {
    //                 // generic error
    //             }
    //
    //             const errProbeData = {
    //                 errors: ["Encountered probe error"]
    //             }
    //             setProbeData(errProbeData);
    //
    //         })
    //
    //         .finally(() => {
    //             // console.log("fetch finally")
    //             setIsLoading(false);
    //
    //         });
    //
    // }, [])


    // const handleProbeSeek = (e) => {
    //     // when Seek Truth clicked when no data
    //     fetchProbeData( {url: urlObj.url, refresh:false} )
    // }

    /*
    u.probes is:
    null,
    something, or
    nothing (empty array)

    if null, no data was yet fetched, so provide a button to do so
    */


    return <>
        <ProbesDisplay urlObj={urlObj} onProbeClick={onProbeClick}/>

        {/*{isLoading*/}
        {/*    ? <ProbeLoader message={"Probing url for truth..."}/>*/}

        {/*    : (urlObj.probe_results === undefined || urlObj.probe_results === null)*/}

        {/*        // if probe_results was not yet fetched, provide a button to do so*/}
        {/*        ? <button className={"in-row-button"} onClick={handleProbeSeek}>*/}
        {/*            <scan>Seek Truth</scan>*/}
        {/*        </button>*/}

        {/*        // else display current probe data*/}
        {/*        : <ProbesDisplay probeData={probeData} onProbeClick={onProbeClick}/>*/}
        {/*}*/}
    </>
}

