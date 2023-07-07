import React, {useCallback, useEffect, useState} from "react";
import UrlDisplay from "./UrlDisplay";
import RefDisplay from "./RefDisplay";
import FldDisplay from "./FldDisplay";
import {URL_FILTER_MAP} from "./filters/urlFilterMaps";
import Loader from "../Loader";
import {fetchStatusUrls} from "../../utils/utils.js"
// import {UrlStatusCheckMethods} from "../../constants/endpoints.js";
import {UrlStatusCheckContext} from "../../contexts/UrlStatusCheckContext"

/*
When this component is rendered, it must "process" the pageData. This involves:
- fetching the URL status codes of all the URLS
- process the references so that they have internal properties indicating their
  health and status so that they can be filtered upon those traits

 */

/*
when we get to this component, we have raw pageData from the
article fetch call, with a few minor decorations added at receive time.

we immediately fetch the URL details for each URL in pageData.urls, creating
urlDict, which is a url-keyed javascript object with the info for each url.
(we may/need/ought to have a urlArray as well, with each entry of the array
pointing to a url object. optimally this object would be a reference to the
one in urlDict.)

we then flatten the Reference list, making only one entry for each multiply-
referenced URL with the number of times reference added as a reference property.

using UrlDict we can check the status of the urls in each reference, appending
each reference array object in pageData.dehydrated_references.
    NB: we should use only "references" property, not "dehydrated_references"

steps to do this:
1. create the reference array property, including only once each multiply-reffed reference;
    set the link_status property of each ref to "0" (will determine format later) as a
    placeholder that will be reified once the URLS all come in
2. pull in url status and place results in urlDict
3. set the link_status for each reference based on status of urls for each link
    (determined by url-keying into urlDict)

  Temporary note: the URL updating functionality is take out of the UrlDisplay component logic

*/
export default function PageData({pageData = {}}) {

    const [selectedViewType, setSelectedViewType] = useState('urls');
    const [isLoadingUrls, setIsLoadingUrls] = useState(false);

    const [dataReady, setDataReady] = useState(false);
    // const [urlArray, setUrlArray] = useState([]);


    const urlStatusCheckMethod = React.useContext(UrlStatusCheckContext);

    // function to process url results and create a urlDict from it
    //
    // called upon useEffect of new url status data
    const processUrls = useCallback( (pageData, urlResults) => {

        const urlDict = {}

        // turn url array into object dict
        // keyed by url; contains: { status_code: XXX, ref_count: 1 or more }
        // makeing room for { hasArchive: true/false, isArchive: true/false }
        urlResults.forEach(d => {
            // console.log (d)
            // initialize entry with count 0 if not there
            if (!urlDict[d.data.url]) {
                urlDict[d.data.url] = {
                    status_code: d.data.status_code,
                    url_count: 0,
                    // set archive status? is this archive or not? maybe not...
                }
            }
            // increment count no matter what
            urlDict[d.data.url].url_count++
        })

        // and append to pageData
        pageData.urlDict = urlDict

    }, [])



    const isArchiveLink = (url) => {
        return url.includes("archive.org")
        || url.includes("archive.today")
    }

    // returns an array of link status for each link of the reference that is
    // not an archive link.
    // link status depends on status of origin link and status of archive link
    const calcLinkStatus = useCallback( (ref, urlDict) => {

        if (!ref.urls || ref.urls.length < 1) return [];

        const archiveLinks = []
        const pureLinks = []

        // divide into pure and archive link sets
        ref.urls.forEach( url => {
            if (isArchiveLink(url)) {
                archiveLinks.push(url)
            } else {
                pureLinks.push(url)
            }
        })

        const linkStatus = []

        pureLinks.forEach( pureLink => {
            // loop thru archive links.
            // if url is "inside" one of the archive links, then add linkStatus
            const foundArchiveUrl = archiveLinks.find( archiveLink => archiveLink.includes(pureLink))

            const archiveStatusCode = urlDict[foundArchiveUrl]?.status_code // foundArchiveUrl may be undefined
            const archiveLinkStatus = (archiveStatusCode === undefined) ? 'none'
                : (archiveStatusCode >= 200 && archiveStatusCode < 400) ? 'good'
                    : 'bad'

            const pureStatusCode = urlDict[pureLink]?.status_code // may be undefined
            const pureLinkStatus = (pureStatusCode === undefined) ? 'none'
                : (pureStatusCode >= 200 && pureStatusCode < 400) ? 'good'
                    : 'bad'
            linkStatus.push( pureLinkStatus + '_' + archiveLinkStatus)

        })

        // if there are no pure links in ref...
        if (linkStatus.length < 1) {
            linkStatus.push('missing')
        }

        return linkStatus

    }, [])



    const processReferences = useCallback( (pageData, refResults) => {
        const namedRefs = {}

        // pull in the templates property from the new refResults and append them to the
        // reference elements in the references array



        // Process the "named" refs by looping thru each reference
        // if named, make an entry in named_refs or increment already entry
        // if named with no content, pull that reference info, and add it to named_ref entry
        //      - its like an array of linky dinks to where ref is in article

        const newRefs = []
        const refs = (!pageData || !pageData.dehydrated_references) ? [] : pageData.dehydrated_references



        // reduce references by eliminating
        refs.forEach(ref => {

            // "named" references point to another "anchor" reference

            // handle named ref by making entry into namedRef dict
            if (ref.name) {
                // initialize if first time
                if (!namedRefs[ref.name]) namedRefs[ref.name] = { count : 0 }
                // increment count
                namedRefs[ref.name].count++
                // if named ref is anchor (footnote subtype === content), save it
                if (ref.type ==='footnote' && ref.footnote_subtype === 'content') {
                    namedRefs[ref.name].origin = ref
                }
            }

            // carry over all refs that are not indirect "named" references
            if (!(ref.type === 'footnote' && ref.footnote_subtype === 'named')) {
                ref.reference_count = 1 // will replace counts of multiply referenced refs in next loop
                newRefs.push( ref )
            }
        })

        // For all references that were saved in named references, set reference count of "anchor" refs
        Object.keys(namedRefs).forEach( refName => {
            const nr = namedRefs[refName]
            nr.origin.reference_count = nr.count
        })

        // process link_status
        newRefs.forEach( ref => {
            ref.link_status = calcLinkStatus(ref, pageData.urlDict)
        })

        // and append to pageData
        pageData.references = newRefs

    }, [calcLinkStatus])

    useEffect( () => {
        const context = 'PageData::useEffect [pageData]'

        const postProcessData = (urlResults, refResults) => {
            processUrls(pageData, urlResults); // creates urlDict
            processReferences(pageData, refResults)
        }

        setIsLoadingUrls(true);

        fetchStatusUrls( {
                urlArray: pageData.urls,
                refresh: pageData.forceRefresh,
                timeout: 60,
                method: urlStatusCheckMethod
            })

            .then(urlResults => {
                console.log(`${context} fetchStatusUrls.then: urlResults has ${urlResults.length} elements`);
                // TODO check erroneous results here -
                pageData.urlArray = urlResults
                console.log(`${context} fetchStatusUrls.then: after pageData.urlArray set to urlResults`);

                postProcessData(urlResults, null); // creates urlDict

                // let the system know all is ready
                setDataReady(true);

                                // // once all url results are in, pull in the ref results
                                // fetchAllReferenceDetails(pageData.references)
                                //     .then(refResults => {
                                //
                                //         postProcessData(); // creates urlDict
                                //         setDataReady(true);
                                //
                                //     })
                                //
                                //     .catch(error => {
                                //
                                //         // TODO: what shall we do for error here?
                                //
                                //     })
                                //
                                //     .finally( () => {
                                //
                                //     })

            })

            .catch(error => {
                console.error(`${context} fetchStatusUrls.catch: ${error}`);
                // TODO: what shall we do for error here?
                //setUrlArray([])
            })

            .finally(() => {
                // turn off "Loading" icon
                setIsLoadingUrls(false);
            })

        }, [pageData, processReferences, processUrls, urlStatusCheckMethod]

    )

    const handleViewTypeChange = (event) => {
        setSelectedViewType(event.target.value);
    };

    const viewTypes = {
        "urls": {
            caption: "URLs"
        },
        "domains": {
            caption: "Domains"
        },
        "stats": {
            caption: "Reference Types"
        },
    }

    const viewOptions = Object.keys(viewTypes).map(viewType => {
        return <div key={viewType} >
            <label>
                <input
                    type="radio"
                    value={viewType}
                    checked={selectedViewType === viewType}
                    onChange={handleViewTypeChange}
                /> {viewTypes[viewType].caption}
            </label>
        </div>
    })


    if (!pageData) return null;


    return <>

        {isLoadingUrls ? <Loader message={"Retrieving URL status codes..."}/>
            : (dataReady ? <div className={"page-data"}>

                        <div className={"ref-filter-types"}>
                            <div>View References by</div>
                            {viewOptions}
                        </div>

                        <div className={`display-content`}>
                            {selectedViewType === 'domains' &&
                                <FldDisplay pageData={pageData}/>
                            }

                            {selectedViewType === 'urls' &&
                                <UrlDisplay pageData={pageData} options={{refresh: pageData.forceRefresh}}
                                            urlFilterMap={URL_FILTER_MAP}/>
                            }

                            {selectedViewType === 'stats' &&
                                <RefDisplay pageData={pageData} options={{}}/>
                            }
                        </div>

                    </div>
                    : <p>Data Not Ready</p>
            )
        }
    </>
}

