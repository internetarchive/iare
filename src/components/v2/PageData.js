import React , { useState, useEffect } from "react";
import PageOverview from "./PageOverview.js";
import References from "./References";
import Urls from "./Urls";
import Flds from "./Flds";
import { API_V2_URL_BASE } from '../../constants/endpoints.js';
import { URL_FILTER_MAP } from "./filters/urlFilterMaps.js";
import Loader from "../Loader";

export default function PageData( { pageData = {} }) {

    const [refOverview, setRefOverview] = useState({}); // overview statistics for Refs; set in effects, passed to PageOverview
    const [refFilter, setRefFilter] = useState( null ); // filter to apply to displayed refs

    const [urlBigArray, setUrlBigArray] = useState([]);
    const [urlOverview, setUrlOverview] = useState({}); // overview statistics for Urls; set in effects, passed to PageOverview
    const [urlFilter, setUrlFilter] = useState( null ); // filter to apply to displayed refs

    // const [timeoutCheckUrl, setTimeoutCheckUrl] = useState(24);
    const timeoutCheckUrl = 60;
    const [isLoadingUrls, setIsLoadingUrls] = useState(false);

    // async function fetchOneRef(refID) {
    //     const endpoint = `${API_V2_URL_BASE}/statistics/reference/${refID}`;
    //     console.log("fetchOneRef: ", endpoint)
    //     const response = await fetch(endpoint);
    //     const data = await response.json();
    //     const status_code = response.status;
    //     return { data, status_code };
    // }
    // async function fetchAllRefs(refIDs) {
    //     const promises = refIDs.map(refID => {
    //         // console.log("fetchAllRefs: fetching: ", ref)
    //         return fetchOneRef(refID) // ?? return fetchOneRef(refID).data?
    //     });
    //     const results = await Promise.all(promises);
    //     return results;
    // }

    // calc ref overview data when pageData changes
    useEffect( () => {
        const refStats = pageData ? (pageData.reference_statistics ? pageData.reference_statistics : {} )
        : {};
        setRefOverview(refStats);
    }, [pageData]) // TODO: change deps to [] ?


    async function fetchOneUrl(url, refresh=false, timeout=0) {

        const endpoint = `${API_V2_URL_BASE}/check-url`
            + `?url=${encodeURIComponent(url)}`
            + (refresh ? "&refresh=true" : '')
            + (timeout > 0 ? `&timeout=${timeout}` : '');

        let status_code = 0;

        // TODO: do we want no-cache, even if no refresh?
        const urlData = await fetch(endpoint, {cache: "no-cache"})
            // THIS IS WHERE 504 is happening!
            .then( response => {
                status_code = response.status
                // console.log("fetchOneUrl: fetch:then: response:", response )
                if (response.ok) {
                    return response.json()
                } else {
                    console.warn(`fetchOneUrl: Error fetching url: ${url}`)

                    // TODO: would be nice to use response.statusText, but
                    // as of 2023.04.08, response.statusText is empty
                    return Promise.resolve({
                        url: url,
                        status_code: 0,
                        status_text: response.statusText,
                        error_text: "error from archive server"
                    })
                    // return Promise.reject(response)

                }
            })

            .catch( (_) => { // if something really bad happened, still return fake synthesized url object

                console.warn(`fetchOneUrl: Something went wrong when fetching url: ${url}`)

                // return fake url data object so URL display interface is not broken
                return Promise.resolve({
                    url: url,
                    status_code: 0,
                    status_text: "unknown",
                    error_text: "Failure during check-url",
                    })
                }
            );

        return { data: urlData, status_code: status_code };
    }

    async function fetchAllUrls(urls, refresh=false) {
        if (!urls) return [];
        const timeout=29; // # seconds, for now...
        console.log(`fetchAllUrls: refresh = ${refresh}, timeout = ${timeout}`)
        const promises = urls.map(url => {
            return fetchOneUrl(url, refresh, timeout)
        });
        const results = await Promise.all(promises);
        console.log("fetchAllUrls: after Promise.all, results:" , results)
        return results;
    }

    // eslint-disable-next-line
    const cleanUrl = ( url ) => {
        return encodeURI( url )
    }

    // process fetched url array by simply saving results
    useEffect( () => {
        setIsLoadingUrls(true);
        fetchAllUrls(pageData.urls, pageData.forceRefresh)
            .then(urlResults => {
                console.log(`After fetchAllUrls: ${urlResults.length} results found`);
                setUrlBigArray( urlResults );
            })
            .catch(error => {
                console.error("After fetchAllUrls:", error);
            })

            .finally(() => {
                // turn off "Loading" icon
                setIsLoadingUrls(false);
            });;

// eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pageData]) // TODO: remove dependency (if eslint pragma removed) for fetchAllUrls somehow

    // calc url overview from urlBigArray when changed
    useEffect( () => {

        const urlCounts = Object.keys(URL_FILTER_MAP).map( k => {
            const f = URL_FILTER_MAP[k];
            const count = urlBigArray.filter((f.filterFunction)()).length; // Note the self-evaluating filterFunction!
            return {
                label: f.caption + " (" + count + ")",
                count: count,
                link: k
            }
        });

        setUrlOverview({urlCounts: urlCounts});
    }, [urlBigArray])

    // TODO: change this to get references by iterative fetch on refID array
    const references = pageData.reference_details && pageData.reference_details.length
        ? pageData.reference_details // "old" way
        : pageData.dehydrated_references

    return <>

        <PageOverview
            references={references}
            refOverview={refOverview}
            urlOverview={urlOverview}
            setRefFilter={setRefFilter}   // refFilter passed to <References /> component
            setUrlFilter={setUrlFilter}   // urlFilter passed to <Urls /> component */
        />

        {/*<h3>Page Data</h3>*/}
        <div className={"page-data"}>

            {isLoadingUrls ? <div className={"urls"}>
                <h3 style={{marginBottom:0}}>URLs</h3>
                <Loader message={"retrieving URL information..."}/>
            </div> : <>
                <Urls urlArray={urlBigArray} filter={urlFilter}/>
                { /* TODO: pass in an error callback here? */}
            </>}

            {/*<Urls urlArray={urlBigArray} filter={urlFilter}/>*/}

            <References refs={references} filter={refFilter}/>
            <Flds flds={pageData.fld_counts}/>
        </div>
    </>
}

