// import React , { useState } from "react";
import React , { useState, useEffect } from "react";
import PageOverview from "./PageOverview.js";
import References from "./References";
import Urls from "./Urls";
import Flds from "./Flds";
import { API_V2_URL_BASE } from '../../constants/endpoints.js';


export default function PageData( { pageData = {} }) {

    // const [endpointRefs, setEndpointRefs] = useState("");
    // const [endpointAll, setEndpointAll] = useState("");
    // const [refs, setRefs] = useState([]);
    const [refFilter, setRefFilter] = useState( null ); // filter to apply to displayed refs
    const [urlFilter, setUrlFilter] = useState( null ); // filter to apply to displayed refs
        // (see PageOverview for filter definitions)
    // const [urlArray, setUrlArray] = useState([]);
    // const [urlMap, setUrlMap] = useState({}); // keyed pointers to array elements
    const [urlBigArray, setUrlBigArray] = useState([]);
    // const [refreshTime, setRefreshTime] = useState(null);

    // const wariID = pageData ? pageData.wari_id : null;
    //
    // // fetch references when wariID changes
    // useEffect(()=> {
    //
    //                     // // handle null pageData
    //                     // if (!pageData) {
    //                     //     setRefs(null);
    //                     //     return;
    //                     // }
    //
    //     const myEndpointRefs = `${API_V2_URL_BASE}/statistics/references?wari_id=${wariID}&offset=0`;
    //     // const myEndpointAll = `${API_V2_URL_BASE}/statistics/all?lang=en&site=wikipedia&title=Car`;
    //     const myEndpointAll = `${API_V2_URL_BASE}/statistics/all?lang=${pageData.lang}&site=${pageData.site}&title=${pageData.title}`;
    //
    //
    //     // fetch the data
    //     fetch(myEndpointRefs, {
    //     })
    //
    //         .then((res) => {
    //             if(!res.ok) throw new Error(res.status);
    //             return res.json();
    //         })
    //
    //         .then((data) => {
    //             setRefs(data.references);
    //         })
    //
    //         .catch((err) => {
    //             //setMyError(err.toString())
    //
    //             // todo: what to do here on error?
    //
    //             setRefs(null);
    //         })
    //
    //         .finally(() => {
    //             // console.log("fetch finally")
    //             // setIsLoading(false);
    //             setEndpointRefs(myEndpointRefs) // changes endpoint display
    //             setEndpointAll(myEndpointAll) // changes endpoint display
    //         });
    //
    //     // eslint-disable-next-line react-hooks/exhaustive-deps
    //     }, [wariID])
    //

    // const endpointRefs = `${API_V2_URL_BASE}/statistics/references?wari_id=${pageData.wari_id}&offset=0`;
    // const endpointAll = `${API_V2_URL_BASE}/statistics/all?lang=${pageData.lang}&site=${pageData.site}&title=${pageData.title}`;


    async function fetchOneUrl(url) {
        const endpoint = `${API_V2_URL_BASE}/check-url?url=${encodeURIComponent(url)}`;
        // console.log("fetchOneUrl: ", endpoint)
        const response = await fetch(endpoint);
        const data = await response.json();
        const status_code = response.status;
        return { data, status_code };
    }
    async function fetchAllUrls(urls) {
        const promises = urls.map(url => {
            // console.log("fetchAllUrls: fetching: ", url)
            return fetchOneUrl(url)
        });
        const results = await Promise.all(promises);
        return results;
    }

    // eslint-disable-next-line
    const cleanUrl = ( url ) => {
        return encodeURI( url )
    }


//     // transform url array of strings into array of objects
//     useEffect( () => {
//         let myMap = {};
//         let myUrls = pageData.urls.map((url, i) => {
//             const uObj = { url: url, status_code : 0 }
//             myMap[url] = uObj;
//             return uObj; // as array object
//         });
//
//         setUrlArray(myUrls);
//         setUrlMap(myMap);
//
// // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, [])

    // transform url array of strings into array of objects
    useEffect( () => {

        fetchAllUrls(pageData.urls)
            .then(results => {
                console.log(`fetchAllUrls: ${results.length} results found`); // Do whatever you want with the results
                console.log(results);

                setUrlBigArray( results );
                // // we have an array of url objects as results...deal with them...
                // results.forEach( d => {
                //     let urlClean = cleanUrl(d.data.url);
                //
                //     console.log( `url: ${urlClean}, status code: ${d.data.status_code}, cached: ${d.data.served_from_cache ? 'YES' : 'NO'}`)
                //
                //     let u = urlMap[urlClean];
                //     if (u) {
                //         u.status_code = d.data.status_code;
                //         u.data = d.data;
                //     } else {
                //         console.error(`No url entry found for return url ${urlClean}`)
                //     }
                // })

            })
            .catch(error => {
                console.error(error);
            });

// eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const references = pageData.reference_details && pageData.reference_details.length ? pageData.reference_details : pageData.dehydrated_references

    return <>

        <PageOverview pageData={pageData} setRefFilter={setRefFilter} setUrlFilter={setUrlFilter} /> {/* setFilter in turn sets the filter for <References /> component */ }

        <h3>Page Data</h3>
        {/*{ <!-- display endpoint for debugging -->}*/}
        {/*<p>references endpoint: <a href={endpointRefs} target={"_blank"} rel={"noreferrer"} >{endpointRefs}</a></p>*/}
        {/*<p>all endpoint: <a href={endpointAll} target={"_blank"} rel={"noreferrer"} >{endpointAll}</a></p>*/}

        <div className={"page-data"}>
            {/* TODO this should be pageData.refs soon enough */}
            {/*<References refs={refs} filter={refFilter}/>*/}
            <References refs={references} filter={refFilter}/>
            <Urls urlArray={urlBigArray} filter={urlFilter}/>
            <Flds flds={pageData.fld_counts}/>
        </div>
    </>
}

