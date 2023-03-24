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
    const [overview, setOverview] = useState({}); // overview statistics; set in sub-components, passed to PageOverview


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

    // transform url array of strings into array of objects
    useEffect( () => {

        fetchAllUrls(pageData.urls)
            .then(urlResults => {
                console.log(`fetchAllUrls: ${urlResults.length} results found`); // Do whatever you want with the results

                setUrlBigArray( urlResults );

                // TODO: process url array for overview

                const urlCounts = {}
                let furls = urlResults.filter((d) => {
                    return d.data.status_code >= 200 && d.data.status_code < 300;
                });
                urlCounts.status2xx = furls.length;

                furls = urlResults.filter((d) => {
                    return d.data.status_code >= 300 && d.data.status_code < 400;
                });
                urlCounts.status3xx = furls.length;

                furls = urlResults.filter((d) => {
                    return d.data.status_code >= 400 && d.data.status_code < 500;
                });
                urlCounts.status4xx = furls.length;

                furls = urlResults.filter((d) => {
                    return d.data.status_code >= 500 && d.data.status_code < 600;
                });
                urlCounts.status5xx = furls.length;

                furls = urlResults.filter((d) => {
                    return d.data.status_code === 0;
                });
                urlCounts.statusUnknown = furls.length;

                setOverview(urlCounts);

            })
            .catch(error => {
                console.error(error);
            });

// eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const references = pageData.reference_details && pageData.reference_details.length ? pageData.reference_details : pageData.dehydrated_references

    return <>

        <PageOverview pageData={pageData} overview={overview} setRefFilter={setRefFilter} setUrlFilter={setUrlFilter}/> {/* setFilter in turn sets the filter for <References /> component */ }

        <h3>Page Data</h3>

        <div className={"page-data"}>
            <References refs={references} filter={refFilter}/>
            <Urls urlArray={urlBigArray} filter={urlFilter}/>
            <Flds flds={pageData.fld_counts}/>
        </div>
    </>
}

