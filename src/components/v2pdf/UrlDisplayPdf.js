import React, {useCallback, useEffect, useState} from 'react';
import UrlFlockPdf from "./UrlFlockPdf";
import UrlOverviewPdf from "./UrlOverviewPdf";
import Loader from "../Loader";
import '../shared/urls.css';
import './urls.pdf.css';
import {ConfigContext} from "../../contexts/ConfigContext";
import {UrlStatusCheckMethods} from "../../constants/checkMethods";


/*
UrlDisplayPdf: takes an array of URLs and fetches the status code of each url in the array and displays the results

assumes flocks is an array of url lists:
[
    {
        list: <array of url strings>
        label: <label of flock type>
        tag: <short label of flock type>
    }, ...
]

before processing, the flocks are merged into one big array of url objects:

[
    {
        url: <url>,
        tags: <array of source flocks - could be 1 or more>,
        status_code: <status of check-url>
    }, ...
]
 */
export default function UrlDisplayPdf({flocks = [], options={}, caption = "URLs", filterMap}) {

    const [urlFilter, setUrlFilter] = useState(null); // filter to pass in to UrlFlock
    const [originFilter, setOriginFilter] = useState(null); // filter to pass in to UrlFlock
    const [isLoadingUrls, setIsLoadingUrls] = useState(false);
    const timeoutCheckUrl = 60; // TODO: pass in options?

    const [urlArray, setUrlArray] = useState([]);
    const [urlStatistics, setUrlStatistics] = useState({});

    const myStatusMethods = UrlStatusCheckMethods;
    const myConfig = React.useContext(ConfigContext);
    const myIariBase = myConfig?.iariSource;
    const myStatusMethod = myConfig?.urlStatusMethod;

    const origins = {
        "annotations": {
            caption: "Annotated Links",
            name: 'chkAnnotation',
            tag: 'A',
        },
        "content": {
            caption: "Content/Text Links",
            name: 'chkContent',
            tag: 'C',
        },
        "block": {
            caption: "Block Links",
            name: 'chkBlock',
            tag: 'B',
        },
    }

    // mergeFlocks can take any number of sets of lists, and combine them into one list,
    // with each entry of the list containing a unique url and a tag array describing the
    // origin flock the url came from.
    //
    // There can be more than one origin for each URL
    //
    // currently we have two "flocks" of URLs:
    // - links extracted from the PDF Annotation layer and
    // - links extracted from the PDF Content/Text layer.
    //
    // we may add soon the links from the block text layer
    const mergeFlocks = (flocks) => {

        function addUniqueElement(array, element) {
            if (!array.includes(element)) {
                array.push(element);
            }
        }

        // return empty array if flocks undefined or not an array with length
        if (!flocks || !flocks.length) return [];

        // mergedUrls is object with url as key and tags as array property describing origin flock
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

    async function fetchStatusUrl(urlObject, refresh = false, timeout = 0, method='') {

        const endpoint = `${myIariBase}/check-url`
            + `?url=${encodeURIComponent(urlObject.url)}`
            + (refresh ? "&refresh=true" : '')
            + (timeout > 0 ? `&timeout=${timeout}` : '');

        let status_code = 0;

        // TODO: do we want no-cache, even if no refresh?
        const urlData = await fetch(endpoint, {cache: "no-cache"})

            .then(response => {

                status_code = response.status

                if (response.ok) {
                    return response.json().then(data => {
                        //data.tags = urlObject.tags;
                        // return data;
                        return Promise.resolve({
                            url: urlObject.url,
                            tags: urlObject.tags, // pass-thru

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

    const fetchUrlsIari = async (urlArray, refresh, timeout) => {
        const promises = urlArray.map(urlObj => {
            return fetchStatusUrl(urlObj, refresh, timeout, myStatusMethods.IARI.key)
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

        /*
        // once CORS issue is resolved for IABot endpoint, we will fetch status codes this way:

        // this is how it works in curl:
        // curl -XPOST https://iabot-api.archive.org/testdeadlink.php \
        // -d $'urls=https://www.nytimes.com/2009/01/21/opinion/21wed1.html\nhttps://www.realclearpolitics.com/video/2009/02/moran_obama.html' \
        // -d "authcode=579331d2dc3f96739b7c622ed248a7d3" \
        // -d "returncodes=1"

        const endpoint = "https://iabot-api.archive.org/testdeadlink.php"

        const urls= [
            "https://www.google.com",
            "https://www.archive.org",
        ]

        const requestOptions = {
            method: 'POST',
            // headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ urls: urls, authcode: "579331d2dc3f96739b7c622ed248a7d3", returncodes: 1 })
        };

        // do the rest like corentin...

        */

    }

    const fetchUrlsCorentin = async (urlArray, refresh, timeout) => {

        const endpoint = UrlStatusCheckMethods.CORENTIN.endpoint + "check"

        const urlList = urlArray.map(u => u.url)
        let urlDict = {}
        for (let urlObj of urlArray) {
            urlDict[urlObj.url] = { tags: urlObj.tags }
        }

        const requestOptions = {
            method: 'POST',
            // headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ urls: urlList })
        };
        const urlData = await fetch(endpoint, requestOptions)
            .then(response => {
                if (response.ok) {
                    return response.json().then(data => {
                        // transpose corentin results into "native" url array format
                        /* example corentin results:
                        {url: 'https://www.archive.org', http_status_code: 200, http_status_message: '200 OK'}
                        {url: 'https://www.gXoXoXgXlXe.com', http_status_code: -1, http_status_message: 'max retries reached'}
                         */
                        console.log(data)
                        
                        const myUrls = data.map( entry => {
                            const results = {
                                data: {
                                    url: entry.url,
                                    tags: urlDict[entry.url].tags, // pull from initial value, saved in urlDict
                                    status_code: entry.http_status_code,
                                }
                            }
                            if (entry.http_status_code === -1) {
                                results.data.status_code = 0;
                                results.data.error_code = -1;
                                results.data.error_text = entry.http_status_message;
                            }

                            return results;

                        })

                        return Promise.resolve(myUrls)
                    })

                } else {
                    // we may have a 504 or other erroneous status_code on the check-url call
                    console.warn(`fetchUrlsCorentin: Error fetching urls`)

                    // TODO: would be nice to use response.statusText, but as of 2023.04.08, response.statusText is empty
                    return Promise.resolve({
                        url: "error.url",
                        tags: ['X'],
                        status_code: 0,
                        error_code: 0,
                        error_text: `Error: Server error via CORENTIN endpoint: ${endpoint}`,
                    })
                }
            })

            .catch((_) => { // if something really bad happened, return fake synthesized url object

                    console.warn(`fetchUrlsCorentin: Something went wrong when fetching urls with: ${endpoint}`)

                    // return fake url data object so URL display interface is not broken
                    return Promise.resolve({
                        url: "error.url",
                        tags: ['X'],
                        status_code: 0,
                        error_code: -1,
                        error_text: `Error: Unknown error via CORENTIN endpoint: ${endpoint}`,
                    })
                }
            );

        return urlData;

                    // return [{
                    //
                    //     data: {
                    //     url: "corentin.not.yet.implemented",
                    //     tags: ['ERR'],
                    //     status_code: 0,
                    //     error_code: "0",
                    //     error_text: "CORENTIN status fetch not yet implemented",
                    //     }
                    //
                    // }
                    // ]

    }

    // uses useCallback so that this function can be used as a useEffect dependency, and not cause re-renders everytime
    const fetchStatusUrls = useCallback(async (urlObjectArray, refresh = false) => {

        console.log(`UrlDisplayPdf::fetchStatusUrls (${myStatusMethod}): refresh = ${refresh}, timeout = ${timeoutCheckUrl}`)

        if (!urlObjectArray || !urlObjectArray.length) return [];

        // Chrome developer tools seems to have a problem showing variables imported at the top level
        // By assigning to a local variable, the variable value can be successfully debugged
        const methods = UrlStatusCheckMethods

        if (methods.IARI.key === myStatusMethod) {
            return fetchUrlsIari(urlObjectArray, refresh, timeoutCheckUrl)

        } else if (methods.IABOT.key === myStatusMethod) {
            return fetchUrlsIabot(urlObjectArray, refresh, timeoutCheckUrl)

        } else if (methods.CORENTIN.key === myStatusMethod) {
            return fetchUrlsCorentin(urlObjectArray, refresh, timeoutCheckUrl)
        }
        return []
// eslint-disable-next-line react-hooks/exhaustive-deps
    }, [UrlStatusCheckMethods, myStatusMethod]);


    // process url array upon iterative fetch completion
    useEffect( // [flocks, fetchUrls, options.refresh]
        () => {
            // process all URLs described by merged flocks
            // when finished, set the urlArray state,
            // which triggers a render of UrlFlock

            const mergedFlock = mergeFlocks(flocks)

            setIsLoadingUrls(true);

            fetchStatusUrls( {
                mergedFlock
            }, options.refresh)

                    /*
                    if all went well, urlArray is an array of url objects, something like:
                    [
                        {
                            data: {
                                url: "https://www.google.com",
                                tags: ['X'],
                                status_code: 200,
                            },
                        },

                        {
                            data: {
                                url: "https://archive.org",
                                tags: ['X'],
                                status_code: 200,
                            },
                        },
                        . . .
                    ]
                 */
                .then(urlResults => {
                    // console.log(`fetchUrls.then: urlResults has ${urlResults.length} elements`);
                    setUrlArray(urlResults);
                })

                .catch(error => {
                    // console.error(`fetchUrls.catch: ${error}`);
                    // TODO: what shall we do for error here?
                    setUrlArray([])
                })

                .finally(() => {
                    // turn off "Loading" icon
                    setIsLoadingUrls(false);
                })

        },
        // []
        [flocks, fetchStatusUrls, options.refresh]
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
        console.log(`UrlDisplayPdf: handleAction: action=${action}, value=`, value);

        // action is setFilter and value is filter key name
        if (action === "setFilter") {
            const f = filterMap[value];
            setUrlFilter(f)
        }

        if (action === "setOriginFilter") {
            // value is array of tags: ['A','C','B', 'etc']

            let caption = '';
            // build up caption with included origins
            Object.keys(origins).forEach( key => {
                const origin = origins[key];
                if (value.includes(origin.tag)) {
                    caption += (caption ? ', ' : '') + origin.caption;
                }
            });
            caption = caption ? `Links from: ${caption}` : 'No origins specified'

            setOriginFilter({
                filterFunction: () => (d) => {
                    for (let originTag of value) {
                        if (d.data.tags.includes(originTag)) return true;
                    }
                },
                caption: caption,
            })

        }
// eslint-disable-next-line
    }, [filterMap] )
    // }, [filterMap, origins] )

    return <>
        <div className={"section-box url-overview-column"}>
            <h3>{caption}</h3>
            <UrlOverviewPdf statistics={urlStatistics} origins={origins} onAction={handleAction}/>
        </div>

        {isLoadingUrls
            ? <Loader message={"Retrieving URL status codes..."}/>
            : <>
                <div className={"section-box"}>
                    <h3 className={'status-method-display'} >Status Check Method: <span
                        className={'embiggen'}>{myStatusMethod}</span></h3>
                    <UrlFlockPdf urlArray={urlArray} urlFilterDef={urlFilter} originFilterDef={originFilter}/>
                </div>

            </>
        }
    </>
}
