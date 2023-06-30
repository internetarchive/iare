import React, {useEffect, useMemo, useState} from "react";
import UrlDisplay from "./UrlDisplay";
import RefDisplay from "./RefDisplay";
import FldDisplay from "./FldDisplay";
import {URL_FILTER_MAP} from "./filters/urlFilterMaps";
import Loader from "../Loader";
import {fetchStatusUrls} from "../../utils/utils.js"

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

    const [urlArray, setUrlArray] = useState([]);

    useEffect( () => {
            const context = 'PageData::useEffect [pageData]'

            setIsLoadingUrls(true);

            fetchStatusUrls(pageData.urls)

                .then(urlResults => {
                    console.log(`${context} fetchStatusUrls.then: urlResults has ${urlResults.length} elements`);
                    // TODO check erroneous results here -
                    setUrlArray( urlResults );
                })

                .catch(error => {
                    console.error(`${context} fetchStatusUrls.catch: ${error}`);
                    // TODO: what shall we do for error here?
                    setUrlArray([])
                })

                .finally(() => {
                    // turn off "Loading" icon
                    setIsLoadingUrls(false);
                })

        },
        [pageData, fetchStatusUrls]
    )


    // when urlArray is modified, use it to process references
    useEffect( () => {

        console.log("PageData: useEffect[urlArray]: process refs based on url statuses")

        // set pageData.urlArray
        pageData.urlArray = urlArray

        // process references into unique entries array
        pageData.references = []

    }, [urlArray])


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
            : <div className={"page-data"}>

                <div className={"ref-filter-types"}>
                    <div>View References by</div>
                    {viewOptions}
                </div>

                <div className={`display-content`}>
                    {selectedViewType === 'domains' &&
                        <FldDisplay pageData = {pageData} />
                    }

                    {selectedViewType === 'urls' &&
                        <UrlDisplay pageData={pageData} options={{refresh: pageData.forceRefresh}}
                                    caption="URL Filters" filterMap={URL_FILTER_MAP} />
                    }

                    {selectedViewType === 'stats' &&
                        <RefDisplay pageData={pageData} options={{}} />
                    }
                </div>

            </div>
        }
    </>
}

