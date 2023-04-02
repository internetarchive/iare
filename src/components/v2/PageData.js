import React , { useState, useEffect } from "react";
import PageOverview from "./PageOverview.js";
import References from "./References";
import Urls from "./Urls";
import Flds from "./Flds";
import { API_V2_URL_BASE } from '../../constants/endpoints.js';
import { URL_FILTER_MAP } from "./filterMaps";


export default function PageData( { pageData = {} }) {

    const [refOverview, setRefOverview] = useState({}); // overview statistics for Refs; set in effects, passed to PageOverview
    const [refFilter, setRefFilter] = useState( null ); // filter to apply to displayed refs

    const [urlBigArray, setUrlBigArray] = useState([]);
    const [urlOverview, setUrlOverview] = useState({}); // overview statistics for Urls; set in effects, passed to PageOverview
    const [urlFilter, setUrlFilter] = useState( null ); // filter to apply to displayed refs

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
    }, [pageData])


    async function fetchOneUrl(url) {
        const endpoint = `${API_V2_URL_BASE}/check-url?url=${encodeURIComponent(url)}`;
        // console.log("fetchOneUrl: endpoint = ", endpoint)
        const response = await fetch(endpoint);
        const data = await response.json();
        const status_code = response.status;
        return { data, status_code };
    }
    async function fetchAllUrls(urls) {
        if (!urls) return [];
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

    // process fetched url array by simply saving results
    useEffect( () => {
        fetchAllUrls(pageData.urls)
            .then(urlResults => {
                console.log(`fetchAllUrls: ${urlResults.length} results found`);
                setUrlBigArray( urlResults );
            })
            .catch(error => {
                console.error(error);
            });
// eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pageData])

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
    const references = pageData.reference_details && pageData.reference_details.length ? pageData.reference_details : pageData.dehydrated_references

    return <>

        <PageOverview refOverview={refOverview}
                      urlOverview={urlOverview}
                      setRefFilter={setRefFilter}   // refFilter passed to <References /> component
                      setUrlFilter={setUrlFilter}   // urlFilter passed to <Urls /> component */
                    />

        <h3>Page Data</h3>
        <div className={"page-data"}>
            <Urls urlArray={urlBigArray} filter={urlFilter}/>
            <References refs={references} filter={refFilter}/>
            <Flds flds={pageData.fld_counts}/>
        </div>
    </>
}

