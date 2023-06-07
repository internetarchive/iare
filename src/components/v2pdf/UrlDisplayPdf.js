import React, {useCallback, useEffect, useState} from 'react';
import UrlFlockPdf from "./UrlFlockPdf";
import UrlOverviewPdf from "./UrlOverviewPdf";
import {API_V2_URL_BASE} from "../../constants/endpoints";
import Loader from "../Loader";
import '../shared/urls.css';
import './urls.pdf.css';

/*
assume flocks is an array of:
[
{
    flockList: <array of url strings>
    caption: <label of flock type>
    tag: <short label of flock type>
}
], ...

or:

{
    <flock tag> : {
        caption : <long name of flock type>
        flockList: [ <array of url strings>
    },
    { ... }, ...
}

before processing, we merge the flocks into one big array of url objects:

[
    {
        url: <url>,
        tags: <array of source flocks - could be 1 or more>,
        status_code: <status of check-url>
    }
], ...
 */
export default function UrlDisplayPdf({caption = "URLs", flocks = [], options={}, filterMap}) {

    const [urlFilter, setUrlFilter] = useState(null); // filter to pass in to UrlFlock
    const [originFilter, setOriginFilter] = useState(null); // filter to pass in to UrlFlock
    const [isLoadingUrls, setIsLoadingUrls] = useState(false);
    const timeoutCheckUrl = 60; // TODO: pass in options?

    const [urlArray, setUrlArray] = useState([]);
    const [urlStatistics, setUrlStatistics] = useState({});


    const origins = {
        "annotations": {
            caption: "Annotated Links",
            name: 'chkAnnotation'
        },
        "content": {
            caption: "Content/Text Links",
            name: 'chkContent'
        },
    }

    // for practical purposes, we have two "flocks" of URLs: one for annotated links and one for text, or content links.
    // mergeFlocks can take any number of sets of lists, and combine them into one list, with
    // an entry for each unique url, and a tags array containing the tags of all lists that
    // the url is represented in.
    const mergeFlocks = (flocks) => {

        function addUniqueElement(array, element) {
            if (!array.includes(element)) {
                array.push(element);
            }
        }

        // return empty array if flocks undefined or not an array with length
        if (!flocks || !flocks.length) return [];

        let mergedUrls = {};
        for (const flock of flocks) {
            for (const url of flock.list) {
                if (mergedUrls[url]) {
                    addUniqueElement(mergedUrls[url].tags, flock.tag)
                } else {
                    // create element for url
                    mergedUrls[url] = {tags: [flock.tag]}
                }
            }
        }

        // convert keyed list into array
        return Object.keys(mergedUrls).map( url => {
            return { url: url, tags: mergedUrls[url].tags }
        })
    }

    async function fetchOneUrl(urlObject, refresh = false, timeout = 0) {

        const endpoint = `${API_V2_URL_BASE}/check-url`
            + `?url=${encodeURIComponent(urlObject.url)}`
            + (refresh ? "&refresh=true" : '')
            + (timeout > 0 ? `&timeout=${timeout}` : '');

        let status_code = 0;

        // TODO: do we want no-cache, even if no refresh?
        const urlData = await fetch(endpoint, {cache: "no-cache"})

            .then(response => {

                status_code = response.status
                // console.log("fetchOneUrl: fetch:then: response:", response )

                if (response.ok) {
                    return response.json().then(data => {
                        //data.tags = urlObject.tags;
                        // return data;
                        return Promise.resolve({
                            url: urlObject.url,
                            tags: urlObject.tags, // pass-thru

                            // we fall back to status_code if testdeadlink_status_code does not exist
                            // this is a caching bug
                            status_code: data.testdeadlink_status_code ? data.testdeadlink_status_code : data.status_code,
                            // status_code: data.testdeadlink_status_code
                            // status_code: data.status_code,
                        })
                    })

                } else {
                    // we may have a 504 or other erroneous status_code on the check-url call
                    console.warn(`fetchOneUrl: Error fetching url: ${urlObject.url}`)

                    // TODO: would be nice to use response.statusText, but as of 2023.04.08, response.statusText is empty
                    return Promise.resolve({
                        url: urlObject.url,
                        tags: urlObject.tags, // pass-thru
                        status_code: 0,
                        error_code: response.status,
                        error_text: response.statusText ? response.statusText : "error from server",
                    })
                }
            })

            .catch((_) => { // if something really bad happened, still return fake synthesized url object

                    console.warn(`fetchOneUrl: Something went wrong when fetching url: ${urlObject.url}`)

                    // return fake url data object so URL display interface is not broken
                    return Promise.resolve({
                        url: urlObject.url,
                        tags: urlObject.tags, // pass-thru
                        status_code: 0,
                        error_code: -1, // we don't know why this happened
                        error_text: "Failure during check-url", // is there an error message available here?
                    })
                }
            );

        return {data: urlData, status_code: status_code};
    }

// we use useCallback so that function can be used as dependency for useEffect
    const fetchAllUrls = useCallback(async (urlObjectArray, refresh = false) => {

        console.log(`UrlDisplayPdf::fetchAllUrls: refresh = ${refresh}, timeout = ${timeoutCheckUrl}`)

        if (!urlObjectArray) return [];

        const promises = urlObjectArray.map(urlObj => {
            return fetchOneUrl(urlObj, refresh, timeoutCheckUrl)
        });

        // assumes all promises successful
        // TODO: error trap this promise call with a .catch
        const results = await Promise.all(promises);

        // console.log("fetchAllUrls: after Promise.all, results:" , results)
        return results;
    }, []);


    // process url array upon iterative fetch completion
    useEffect(() => {
            // merge all flocks together into one giant flock list,
            // with properties of each entry set for wuich flock it came from

            const mergedFlock = mergeFlocks(flocks)

            setIsLoadingUrls(true);

            fetchAllUrls(mergedFlock, options.refresh)

                .then(urlResults => {
                    console.log(`useEffect[urlFlock] fetchAllUrls.then: ${urlResults.length} results found`);
                    setUrlArray(urlResults);
                })

                .catch(error => {
                    console.error("After fetchAllUrls:", error);
                    console.error(`useEffect[urlFlock] fetchAllUrls.catch: ${error}`);
                    // TODO: what shall we do for error here?
                    setUrlArray([])
                })

                .finally(() => {
                    // turn off "Loading" icon
                    setIsLoadingUrls(false);
                });
            ;

        },
        // []
        [flocks, fetchAllUrls, options.refresh]
    )


    // calculate url stats when urlArray changed
    useEffect( () => {

        const urlCounts = Object.keys(filterMap).map( key => {
            const f = filterMap[key];
            const count = urlArray.filter((f.filterFunction)()).length; // Note the self-evaluating filterFunction!
            return {
                label: f.caption + " (" + count + ")",
                count: count,
                link: key
            }
        });

        setUrlStatistics({urlCounts: urlCounts});

    }, [urlArray, filterMap])


// result is an object: { action: <action name>, value: <param value> }
    const handleAction = useCallback( (result) => {
        const {action, value} = result;
        console.log(`UrlDisplay: handleAction: action=${action}, value=${value}`);

        // action is setFilter and value is filter key name
        if (action === "setFilter") {
            const f = filterMap[value];
            setUrlFilter(f)
        }

        if (action === "setOriginFilter") {
            // value = AC, C, A or ''
            if (value === 'AC') { // return all
                setOriginFilter({
                    filterFunction: () => (d) => {
                        return true // all urls
                    },
                    caption: "Annotations and Content"
                })
            } else if (value === 'A') {
                setOriginFilter({
                    filterFunction: () => (d) => {
                        return d.data.tags.includes( 'A') && d.data.tags.length === 1
                    },
                    caption: "Just Annotations"
                })
            } else if (value === 'C') {
                setOriginFilter({
                    filterFunction: () => (d) => {
                        return d.data.tags.includes( 'C') && d.data.tags.length === 1
                    },
                    caption: "Just Content"
                })
            } else {
                setOriginFilter({
                    filterFunction: () => (d) => {
                        return false
                    },
                    caption: "No Links extracted"
                })
            }

            // const f = {
            //     caption: `Contains ${targetDomain} domain`,
            //     desc: `Citations with domain: ${targetDomain}`,
            //     filterFunction: () => (d) => {
            //         return d.tags.includes( targetDomain )
            //     },
            // }

        }

    }, [filterMap] )

    return <>
        <div className={"section-box url-overview-column"}>
            <h3>{caption}</h3>
            <UrlOverviewPdf statistics={urlStatistics} origins={origins} onAction={handleAction}/>
        </div>

        {isLoadingUrls
            ? <Loader message={"retrieving URL information..."}/>
            : <>
                <div className={"section-box"}>
                    <UrlFlockPdf urlArray={urlArray} urlFilterDef={urlFilter} originFilterDef={originFilter}/>
                </div>

            </>
        }
    </>
}
