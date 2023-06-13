// import React, {useCallback, useEffect, useState, useContext} from 'react';
import React, {useCallback, useEffect, useState} from 'react';
import UrlFlock from "./UrlFlock";
import UrlOverview from "./UrlOverview";
import {IARI_V2_URL_BASE} from "../../constants/endpoints";
import {UrlStatusCheckMethods} from "../../constants/endpoints.js";
import {UrlStatusCheckContext} from "../../contexts/UrlStatusCheckContext"
import Loader from "../Loader";
import '../shared/urls.css';
// import RefFlock from "../v2/RefFlock";

export default function UrlDisplay ({ urlFlock, options, caption = "URLs", filterMap } ) {

    const [urlFilter, setUrlFilter] = useState( null ); // filter to pass in to UrlFlock
    const [isLoadingUrls, setIsLoadingUrls] = useState(false);
    const timeoutCheckUrl = 60; // TODO: pass in options?

    const [urlArray, setUrlArray] = useState([]);
    const [urlStatistics, setUrlStatistics] = useState({});

    // pull in the Status Check Method
    const urlStatusCheckMethod = React.useContext(UrlStatusCheckContext);
    const myStatusMethods = UrlStatusCheckMethods;

    async function fetchStatusUrl(url, refresh=false, timeout=0, method='') {

        const endpoint = `${IARI_V2_URL_BASE}/check-url`
            + `?url=${encodeURIComponent(url)}`
            + (refresh ? "&refresh=true" : '')
            + (timeout > 0 ? `&timeout=${timeout}` : '')

        let status_code = 0;

        // TODO: do we want no-cache, even if no refresh?
        const urlData = await fetch(endpoint, {cache: "no-cache"})

            .then( response => {

                status_code = response.status

                if (response.ok) {
                    // return response.json()
                    return response.json().then(data => {
                        //data.tags = urlObject.tags;
                        // return data;
                        return Promise.resolve({
                            url: url,

                            status_code:
                                method === myStatusMethods.IABOT.key
                                    ? data.testdeadlink_status_code
                                : method === myStatusMethods.IARI.key
                                    ? data.status_code
                                : -1,
                        })
                    })

                } else {
                    // we may have a 504 or other erroneous status_code on the check-url call
                    console.warn(`fetchOneUrl: Error fetching url: ${url}`)

                    // TODO: would be nice to use response.statusText, but
                    // as of 2023.04.08, response.statusText is empty
                    return Promise.resolve({
                        url: url,
                        status_code: 0,
                        error_code: response.status,
                        error_text: response.statusText ? response.statusText : "error from server",
                    })

                }
            })

            .catch( (_) => { // if something really bad happened, still return fake synthesized url object

                    console.warn(`fetchOneUrl: Something went wrong when fetching url: ${url}`)

                    // return fake url data object so URL display interface is not broken
                    return Promise.resolve({
                        url: url,
                        status_code: 0,
                        error_code: -1, // we don't know why this happened
                        error_text: "Failure during check-url", // is there an error message available here?
                    })
                }
            );

        return { data: urlData, status_code: status_code };
    }


    const fetchUrlsIari = async (urlArray, refresh, timeout) => {
        const promises = urlArray.map(url => {
            return fetchStatusUrl(url, refresh, timeout, myStatusMethods.IARI.key)
        });

        // assumes all promises successful
        // TODO: error trap this promise call with a .catch
        return await Promise.all(promises);
    }

    const fetchUrlsIabot = async (urlArray, refresh, timeout) => {
        const promises = urlArray.map(urlObj => {
            return fetchStatusUrl(urlObj, refresh, timeout, myStatusMethods.IABOT.key)
        });

        // assumes all promises successful
        // TODO: error trap this promise call with a .catch
        return await Promise.all(promises);
    }

    const fetchUrlsCorentin = async (urlArray, refresh, timeout) => {
        // const promises = urlArray.map(urlObj => {
        //     return fetchStatusUrl(urlObj, refresh, timeout)
        // });
        //
        // // assumes all promises successful
        // // TODO: error trap this promise call with a .catch
        // return await Promise.all(promises);

        // return [];

        return [{

            data: {
                url: "corentin.not.yet.implemented",
                tags: ['ERR'],
                status_code: 0,
                error_code: "0",
                error_text: "CORENTIN status fetch not yet implemented",
            }

        }
        ]
    }
    // we use useCallback so that function can be used as dependency for useEffect
    const fetchStatusUrls = useCallback( async (urlArray=[], refresh=false) => {

        console.log(`fetchStatusUrls: refresh = ${refresh}, timeout = ${timeoutCheckUrl}`)

        if (!urlArray || !urlArray.length) return [];

        // Chrome developer tools seems to have a problem showing variables imported at the top level
        // By assigning to a local variable, the variable value can be successfully debugged
        const methods = UrlStatusCheckMethods

        if (methods.IARI.key === urlStatusCheckMethod) {
            return fetchUrlsIari(urlArray, refresh, timeoutCheckUrl)

        } else if (methods.IABOT.key === urlStatusCheckMethod) {
            return fetchUrlsIabot(urlArray, refresh, timeoutCheckUrl)

        } else if (methods.CORENTIN.key === urlStatusCheckMethod) {
            return fetchUrlsCorentin(urlArray, refresh, timeoutCheckUrl)
        }
        return [] // TODO: what to do if error or not one of handled methods?


                    // const promises = urlArray.map(url => {
                    //     return fetchStatusUrl(url, refresh, timeoutCheckUrl)
                    // });
                    //
                    // // assumes all promises successful
                    // // TODO: error trap this promise call with a .catch
                    // const results = await Promise.all(promises);
                    //
                    // // console.log("fetchAllUrls: after Promise.all, results:" , results)
                    // return results;
// eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    // when new urlFlock (which is every new render of component),
    // process url array upon iterative fetch completion
    // currently simply saves results directly;
    //  - could "process" each element to extract the data:{} object, but not doing that now.
    //      - if we did change to extract the object, we would have to change the filter logic
    //        in many of the filter definitions: use d.<value> rather than d.data.<value>
    //
    useEffect( () => {
        setIsLoadingUrls(true);

        fetchStatusUrls(urlFlock, options.refresh)

            .then(urlResults => {
                console.log(`useEffect[urlFlock, fetchStatusUrls, options.refresh] fetchStatusUrls.then: urlResults has ${urlResults.length} elements`);
                setUrlArray( urlResults );
            })

            .catch(error => {
                console.error(`useEffect[urlFlock, fetchStatusUrls, options.refresh] fetchStatusUrls.catch: ${error}`);
                // TODO: what shall we do for error here?
                setUrlArray([])
            })

            .finally(() => {
                // turn off "Loading" icon
                setIsLoadingUrls(false);
            })

// eslint-disable-next-line react-hooks/exhaustive-deps
        },
        // TODO: see if this works the same by giving a dependency array of []
        [urlFlock, fetchStatusUrls, options.refresh]
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
    const handleAction = (result) => {
        const {action, value} = result;
        console.log (`UrlDisplay: handleAction: action=${action}, value=${value}`);

        // action is setFilter and value is filter key name
        if (action === "setFilter") {
            const f = filterMap[value];
            setUrlFilter(f)
        }

        // TODO: Action for setReferenceFilter/ShowReference for filtered URLS
    }

    // todo:
    // grab statusCheckMethod from context
    return <>

        <div className={"section-box url-overview-column"}>
            <h3>{caption}</h3>
            <UrlOverview statistics={urlStatistics} onAction={handleAction}/>
        </div>

        {isLoadingUrls
            ? <Loader message={"retrieving URL information..."}/>
            : <>
                <div className={"section-box"}>
                    <div>Status Check Method is: {urlStatusCheckMethod}</div>
                    <p className={"ref-note-alert"}>Status Method for Wiki links is still under construction...</p>
                    <UrlFlock urlArray={urlArray} urlFilterDef={urlFilter} onAction={handleAction}/>
                </div>

                <div className={"section-box"}>
                    <h3>References</h3>
                    <h4 style={{fontStyle:"italic",fontWeight:"bold"}}>Under construction</h4>
                    {/*<RefFlock refArray={refArray} refFilterDef={refFilter} />*/}
                    <p className={"ref-note-alert"}>Filterable Reference List goes here</p>
                </div>
            </>
        }
    </>
}
