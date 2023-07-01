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

  Temporary note: the URL updating functionality os take out of the UrlDisplay component logic
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


    const processReferences = useCallback( (pageData) => {
        const namedRefs = {}

        // loop thru refs
        // if named, make an entry in named_refs or increment already entry
        // if named with no content, pull that reference info, and add it to named_ref entry
        //      - its like an array of linky dinks to where ref is in article

        const newRefs = []
        const refs = (!pageData || !pageData.dehydrated_references) ? [] : pageData.dehydrated_references
        refs.forEach(ref => {
            // if ref is named ref
            if (ref.name) {
                if (!namedRefs[ref.name]) namedRefs[ref.name] = { count : 0 }
                namedRefs[ref.name].count++
                // if ref is origin (footnote subtype - content), save it
                if (ref.type ==='footnote' && ref.footnote_subtype === 'content') {
                    namedRefs[ref.name].origin = ref
                }
            }

            // only carry over refs trhat are real content refs and not "reference references", i.e. named
            // references that point to an anchoir ref
            if (!(ref.type === 'footnote' && ref.footnote_subtype === 'named')) {
                // init refcount to 1 for all refs; will replace ref counts in next loop
                ref.reference_count = 1
                newRefs.push( ref )
            }
        })

        // resolve named refs to their anchor refs
        Object.keys(namedRefs).forEach( refName => {
            const nr = namedRefs[refName]
            nr.origin.reference_count = nr.count
            // lets see if that works!
        })

        // and append to pageData
        pageData.references = newRefs

    }, [])

    useEffect( () => {
        const context = 'PageData::useEffect [pageData]'

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
                processReferences(pageData)
                setDataReady(true);
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

        }, [pageData, processReferences, urlStatusCheckMethod]

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
                                            caption="URL Filters" filterMap={URL_FILTER_MAP}/>
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

