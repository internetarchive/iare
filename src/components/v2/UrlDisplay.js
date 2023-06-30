import React, {useCallback, useEffect, useState} from 'react';
import UrlFlock from "./UrlFlock";
import UrlOverview from "./UrlOverview";
import {IARI_V2_URL_BASE} from "../../constants/endpoints";
import {UrlStatusCheckMethods} from "../../constants/endpoints.js";
import {UrlStatusCheckContext} from "../../contexts/UrlStatusCheckContext"
import Loader from "../Loader";
import '../shared/urls.css';
import RefFlock from "./RefFlock";


export default function UrlDisplay ({ pageData, options, caption = "URLs", filterMap } ) {

    console.log("UrlDisplay: render");

    const [urlFilter, setUrlFilter] = useState( null ); // filter to pass in to UrlFlock
    const [isLoadingUrls, setIsLoadingUrls] = useState(false);
    const timeoutCheckUrl = 60; // TODO: pass in options?

    // const [urlArray, setUrlArray] = useState([]);
    const [urlStatistics, setUrlStatistics] = useState({});

    const [refFilter, setRefFilter] = useState( null ); // filter to pass in to RefFlock
    const [selectedUrl, setSelectedUrl] = useState('');

    // pull in the Status Check Method
    const urlStatusCheckMethod = React.useContext(UrlStatusCheckContext);
    const myStatusMethods = UrlStatusCheckMethods;

                        // const fetchStatusUrl = useCallback(async (url, refresh=false, timeout=0, method='') => {
                        //
                        //     const endpoint = `${IARI_V2_URL_BASE}/check-url`
                        //         + `?url=${encodeURIComponent(url)}`
                        //         + (refresh ? "&refresh=true" : '')
                        //         + (timeout > 0 ? `&timeout=${timeout}` : '')
                        //
                        //     let status_code = 0;
                        //
                        //     // TODO: do we want no-cache, even if no refresh?
                        //     const urlData = await fetch(endpoint, {cache: "no-cache"})
                        //
                        //         .then( response => {
                        //
                        //             status_code = response.status
                        //
                        //             if (response.ok) {
                        //                 // return response.json()
                        //                 return response.json().then(data => {
                        //                     //data.tags = urlObject.tags;
                        //                     // return data;
                        //                     return Promise.resolve({
                        //                         url: url,
                        //
                        //                         status_code:
                        //                             method === myStatusMethods.IABOT.key
                        //                                 ? data.testdeadlink_status_code
                        //                             : method === myStatusMethods.IARI.key
                        //                                 ? data.status_code
                        //                             : -1,
                        //                     })
                        //                 })
                        //
                        //             } else {
                        //                 // we may have a 504 or other erroneous status_code on the check-url call
                        //                 console.warn(`fetchOneUrl: Error fetching url: ${url}`)
                        //
                        //                 // TODO: would be nice to use response.statusText, but
                        //                 // as of 2023.04.08, response.statusText is empty
                        //                 return Promise.resolve({
                        //                     url: url,
                        //                     status_code: 0,
                        //                     error_code: response.status,
                        //                     error_text: response.statusText ? response.statusText : "error from server",
                        //                 })
                        //
                        //             }
                        //         })
                        //
                        //         .catch( (_) => { // if something really bad happened, still return fake synthesized url object
                        //
                        //                 console.warn(`fetchOneUrl: Something went wrong when fetching url: ${url}`)
                        //
                        //                 // return fake url data object so URL display interface is not broken
                        //                 return Promise.resolve({
                        //                     url: url,
                        //                     status_code: 0,
                        //                     error_code: -1, // we don't know why this happened
                        //                     error_text: "Failure during check-url", // is there an error message available here?
                        //                 })
                        //             }
                        //         );
                        //
                        //     return { data: urlData, status_code: status_code };
                        // }, [myStatusMethods])


                        //     const fetchUrlsIari = useCallback( async (urlArray, refresh, timeout) => {
                        //         const promises = urlArray.map(url => {
                        //             return fetchStatusUrl(url, refresh, timeout, myStatusMethods.IARI.key)
                        //         })
                        //         // assumes all promises successful
                        //         // TODO: error trap this promise call with a .catch
                        //         return await Promise.all(promises);
                        //     }, [fetchStatusUrl, myStatusMethods]);
                        //
                        //
                        //     const fetchUrlsIabot = useCallback( async (urlArray, refresh, timeout) => {
                        //         const promises = urlArray.map(urlObj => {
                        //             return fetchStatusUrl(urlObj, refresh, timeout, myStatusMethods.IABOT.key)
                        //         });
                        //
                        //         // assumes all promises successful
                        //         // TODO: error trap this promise call with a .catch
                        //         return await Promise.all(promises);
                        //     }, [fetchStatusUrl, myStatusMethods]);
                        //
                        //     const fetchUrlsCorentin = useCallback( async (urlArray, refresh, timeout) => {
                        //
                        //         const endpoint = UrlStatusCheckMethods.CORENTIN.endpoint + "check"
                        //
                        //         const urlList = urlArray
                        //             // // no need to create urlDict for Wiki URLs
                        //             // const urlList = urlArray.map(u => u.url)
                        //             // let urlDict = {}
                        //             // for (let urlObj of urlArray) {
                        //             //     urlDict[urlObj.url] = { tags: urlObj.tags }
                        //             // }
                        //
                        //         const requestOptions = {
                        //             method: 'POST',
                        //             body: JSON.stringify({ urls: urlList })
                        //         };
                        //
                        //         const urlData = await fetch(endpoint, requestOptions)
                        //             .then(response => {
                        //                 if (response.ok) {
                        //                     return response.json().then(data => {
                        //                         // transpose corentin results into "native" url array format
                        //                         /* example corentin results:
                        //                         {url: 'https://www.archive.org', http_status_code: 200, http_status_message: '200 OK'}
                        //                         {url: 'https://www.gXoXoXgXlXe.com', http_status_code: -1, http_status_message: 'max retries reached'}
                        //                          */
                        //
                        //                         const myUrls = data.map( entry => {
                        //                             const results = {
                        //                                 data: {
                        //                                     url: entry.url,
                        //                                     /* no tags, as in PDF links */
                        //                                     // tags: urlDict[entry.url].tags, // pull from initial value, saved in urlDict
                        //                                     status_code: entry.http_status_code,
                        //                                 }
                        //                             }
                        //                             if (entry.http_status_code === -1) {
                        //                                 results.data.status_code = 0;
                        //                                 results.data.error_code = -1;
                        //                                 results.data.error_text = entry.http_status_message;
                        //                             }
                        //
                        //                             return results;
                        //
                        //                         })
                        //
                        //                         return Promise.resolve(myUrls)
                        //                     })
                        //
                        //                 } else {
                        //                     // we may have a 504 or other erroneous status_code on the check-url call
                        //                     console.warn(`fetchUrlsCorentin: Error fetching urls`)
                        //
                        //                     // todo Does this need to pass back an array? test debug
                        //                     return Promise.resolve({
                        //                         url: "error.url",
                        //                         ///tags: ['X'],
                        //                         status_code: 0,
                        //                         error_code: 0,
                        //                         error_text: `Error: Server error via CORENTIN endpoint: ${endpoint}`,
                        //                     })
                        //                 }
                        //             })
                        //
                        //             .catch((_) => { // if something really bad happened, return fake synthesized url object
                        //
                        //                     console.warn(`fetchUrlsCorentin: Something went wrong when fetching urls with: ${endpoint}`)
                        //
                        //                     // return fake url data object so URL display interface is not broken
                        //                     return Promise.resolve({
                        //                         url: "error.url",
                        //                         ///tags: ['X'],
                        //                         status_code: 0,
                        //                         error_code: -1,
                        //                         error_text: `Error: Unknown error via CORENTIN endpoint: ${endpoint}`,
                        //                     })
                        //                 }
                        //             );
                        //
                        //         return urlData;
                        //         /*
                        //         return [{
                        //
                        //             data: {
                        //                 url: "corentin.not.yet.implemented",
                        //                 tags: ['ERR'],
                        //                 status_code: 0,
                        //                 error_code: "0",
                        //                 error_text: "CORENTIN status fetch not yet implemented",
                        //             }
                        //
                        //         }
                        //         ]
                        //         */
                        //     }, []);
                        //
                        //
                        //     // we use useCallback so that function can be used as dependency for useEffect
                        //     const fetchStatusUrls = useCallback( async (urlArray=[], refresh=false) => {
                        //
                        //         console.log(`UrlDisplay::fetchStatusUrls (${urlStatusCheckMethod}): refresh = ${refresh}, timeout = ${timeoutCheckUrl}`)
                        //
                        //         if (!urlArray || !urlArray.length) return [];
                        //
                        //         // Chrome developer tools seems to have a problem showing variables imported at the top level
                        //         // By assigning to a local variable, the variable value can be successfully debugged
                        //         const methods = UrlStatusCheckMethods
                        //
                        //         if (methods.IARI.key === urlStatusCheckMethod) {
                        //             return fetchUrlsIari(urlArray, refresh, timeoutCheckUrl)
                        //
                        //         } else if (methods.IABOT.key === urlStatusCheckMethod) {
                        //             return fetchUrlsIabot(urlArray, refresh, timeoutCheckUrl)
                        //
                        //         } else if (methods.CORENTIN.key === urlStatusCheckMethod) {
                        //             return fetchUrlsCorentin(urlArray, refresh, timeoutCheckUrl)
                        //         }
                        //         return [] // TODO: what to do if error or not one of handled methods?
                        //
                        //
                        //                     // const promises = urlArray.map(url => {
                        //                     //     return fetchStatusUrl(url, refresh, timeoutCheckUrl)
                        //                     // });
                        //                     //
                        //                     // // assumes all promises successful
                        //                     // // TODO: error trap this promise call with a .catch
                        //                     // const results = await Promise.all(promises);
                        //                     //
                        //                     // // console.log("fetchAllUrls: after Promise.all, results:" , results)
                        //                     // return results;
                        // // xxeslint-disable-next-line react-hooks/exhaustive-deps
                        //     }, [urlStatusCheckMethod, fetchUrlsIabot, fetchUrlsIari, fetchUrlsCorentin]);


                    // // upon new urlFlock (which is every new render of component as pageData.urls),
                    // // process url array upon using iterative url fetch
                    // // currently simply saves results directly;
                    // //  - could "process" each element to extract the data:{} object, but not doing that now.
                    // //      - if we did change to extract the object, we would have to change the filter logic
                    // //        in many of the filter definitions: use d.<value> rather than d.data.<value>
                    // //
                    // useEffect( () => {
                    //     const context = 'UrlDisplay::useEffect [urlFlock, fetchStatusUrls, options.refresh]'
                    //
                    //     setIsLoadingUrls(true);
                    //
                    //     fetchStatusUrls(pageData.urls, options.refresh)
                    //
                    //         .then(urlResults => {
                    //             console.log(`${context} fetchStatusUrls.then: urlResults has ${urlResults.length} elements`);
                    //             // TODO check erroneous results here -
                    //             setUrlArray( urlResults );
                    //         })
                    //
                    //         .catch(error => {
                    //             console.error(`${context} fetchStatusUrls.catch: ${error}`);
                    //             // TODO: what shall we do for error here?
                    //             setUrlArray([])
                    //         })
                    //
                    //         .finally(() => {
                    //             // turn off "Loading" icon
                    //             setIsLoadingUrls(false);
                    //         })
                    //
                    //     },
                    //     [pageData, fetchStatusUrls, options.refresh]
                    //     )


    // calculate url stats
    useEffect( () => {

        const urlCounts = (!pageData || !pageData.urlArray)
            ? []
            : Object.keys(filterMap).map( key => {
                const f = filterMap[key];
                const count = pageData.urlArray.filter((f.filterFunction)()).length; // Note the self-evaluating filterFunction!
                return {
                    label: f.caption + " (" + count + ")",
                    count: count,
                    link: key
                }
            })

        setUrlStatistics({urlCounts: urlCounts});

    }, [pageData, filterMap])


    // result is an object: { action: <action name>, value: <param value> }
    const handleAction = useCallback( result => {
        const {action, value} = result;
        console.log (`UrlDisplay: handleAction: action=${action}, value=${value}`);

        // action is setFilter and value is filter key name
        if (action === "setFilter") {
            const f = value ? filterMap[value] : null
            setUrlFilter(f)
        }

        // use selected url to filter references list
        if (action === "setUrlReferenceFilter") {
            // value is url to filter references by
            setRefFilter(getUrlRefFilter(value))
            setSelectedUrl(value)
        }

        // clear filter for references list
        if (action === "removeReferenceFilter") {
            // value is url to filter references by
            setRefFilter(getUrlRefFilter(''))
            setSelectedUrl(null)
        }

        // clear filter for URL list
        if (action === "removeUrlFilter") {
            setUrlFilter(null)
            setSelectedUrl(null)
        }


        // TODO: Action for setReferenceFilter/ShowReference for filtered URLS
    }, [filterMap])


    if (!pageData) return null;



    // TODO candidate for external shared function
    // TODO allow array of Urls in targetUrl(s)
    const getUrlRefFilter = (targetUrl) => {

        if (!targetUrl || targetUrl === '') {
            // return {
            //     caption: `Show All`,
            //     desc: `Show ALl Citations`,
            //     filterFunction: () => (d) => {
            //         return true;
            //     },
            // }
            return null; // no filter means all filter
        }

        return {
            caption: <span>Contains URL: <br/><span className={'target-url'}
                ><a href={targetUrl} target={"_blank"} rel={"noreferrer"}>{targetUrl}</a
                ></span></span>,
            desc: `Citations with URL: ${targetUrl}`,
            filterFunction: () => (d) => {
                return d.urls.includes( targetUrl )
            },
        }
    }


    // eslint-disable-next-line no-unused-vars
    const handleCopyClick = () => {
        const convertToCSV = (json) => {
            const rows = json.map((row) => {

                const myRowItems = row.map( (item) => {
                    // from: https://stackoverflow.com/questions/46637955/write-a-string-containing-commas-and-double-quotes-to-csv
                    // We remove blanks and check if the item contains
                    // other whitespace,`,` or `"`.
                    // In that case, we need to quote the item.


                    if (typeof item === 'string') {
                        if (item.replace(/ /g, '').match(/[\s,"]/)) {
                            return '"' + item.replace(/"/g, '""') + '"';
                        }
                        return item
                    } else {
                        return item
                    }
                })
                return myRowItems.join(',');
            });
            return rows.join('\n');
        };

        // get one row per line:
        const jsonData = pageData.urlArray.sort(
            (a, b) => (a.data.url > b.data.url) ? 1 : (a.data.url < b.data.url) ? -1 : 0
        ).map( u => {
            return [ u.data.url, u.data.status_code ]
        })
        // convert to CSV and send to clipboard
        const csvString = convertToCSV(jsonData);

        navigator.clipboard.writeText(csvString)
            .then(() => {
                console.log('CSV data copied to clipboard');
                alert(`CSV data copied to clipboard.`);
            })
            .catch((error) => {
                console.error('Failed to copy CSV data to clipboard:', error);
                alert(`Failed to copy CSV data to clipboard: ${error}`);
            });
    }

    const refArray = (!pageData || !pageData.dehydrated_references)
        ? []
        : pageData.dehydrated_references
    // TODO: change this to references

    const urlListCaption = <h3>URL List</h3>
    const extraCaption = <h4 style={{fontStyle:"italic",fontWeight:"bold"}}>Click URL below to filter References List</h4>

    return <>

        <div className={"section-box url-overview-column"}>
            <h3>{caption}</h3>
            <UrlOverview statistics={urlStatistics} onAction={handleAction}/>
        </div>

        {isLoadingUrls
            ? <Loader message={"Retrieving URL status codes..."}/>
            : <>
                <div className={"section-box"}>
                    {urlListCaption}
                    <UrlFlock urlArray={pageData.urlArray} urlFilterDef={urlFilter}
                              onAction={handleAction} selectedUrl={selectedUrl} extraCaption={extraCaption}/>
                </div>

                <div className={"section-box"}>
                    <h3>References List</h3>
                    <RefFlock refArray={refArray} refFilterDef={refFilter} onAction={handleAction}/>
                </div>
            </>
        }
    </>
}
