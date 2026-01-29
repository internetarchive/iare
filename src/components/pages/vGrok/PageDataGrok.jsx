import React, {useCallback, useEffect, useState} from "react";
import Loader from "../../Loader.jsx";
import GrokDisplay from "./views/Grok/GrokDisplay.jsx";
import {ConfigContext} from "../../../contexts/ConfigContext.jsx";
import {JsonEditor} from "json-edit-react";

/*
When this component is rendered, it must "process" the pageData. This involves:
- fetching the status codes of all the URLS
- process the urls into urlArray
- process the references
  - reduce reference array by coalescing all named refs together
  - associate reference to url items that are "owned" by each reference
*/


export default function PageDataGrok({rawPageData = {}, showViewOptions = false, viewOption = "urls"}) {
    /*
    pageData is the raw data from IARI fetch call, with some decoration properties added for convenience.

    pageData should contain all data about grokipedia article
    for now, that should just be an url array for citations
    */

    const pageData = rawPageData  // TODO why this reassign?? ease of use?
    const [pageErrors, setPageErrors] = useState('')

    const [selectedViewOption, setSelectedViewOption] = useState(viewOption)

    const [isLoadingUrls, setIsLoadingUrls] = useState(false)
    const [isDataReady, setIsDataReady] = useState(true)
    const [urlStatusLoadingMessage, setUrlStatusLoadingMessage] = useState(null)

    let myConfig = React.useContext(ConfigContext)
    myConfig = myConfig ? myConfig : {} // prevents myConfig.<undefined param> errors

    const myIariBase = myConfig.iariSource  // TODO: grab from pageData.iariSource

    const processPageData = useCallback( (pageData, extraData) => {
        // define pageData.urlDict and pageData.urlArray to accommodate flock display component.
        // natively, IARI.extract_grok returns, in its payload:
        //      urls, an array, and
        //      url_dict - same array in dict form with info for each url
        // for processing for grok, all we need to do is assign pageData.urlArray to pageData.urls
        // and pageData.urlDict to pageData.url_dict

        pageData.urlDict = pageData.url_dict

        // make urlArray an array into urlDict
        pageData.urlArray = pageData.urls
            ? pageData.urls.map(urlKey => {
                return {
                    url: urlKey,
                    ...pageData.urlDict[urlKey],
                }
            })
            : []

    }, [])  // no deps, defines callback function once upon component mount


    useEffect( () => { // [myIariBase, pageData, processReferences, processUrls, myStatusCheckMethod]
        // does any extra data fetching from the internet after
        // receiving the initial pageData from IARI

        const fetchAuxPageData = async () => {

            try {

                setUrlStatusLoadingMessage(<>
                    <div>Retrieving URL info.</div>
                </>)
                setIsDataReady(false);
                setIsLoadingUrls(true);

                // if any errors, display
                if (pageData.process_errors?.length > 0) {
                    setPageErrors(pageData.process_errors)
                }

                // do any external fetching here..

                // and process the results
                processPageData(pageData)

                // announce to UI all is ready
                setIsDataReady(true);
                setIsLoadingUrls(false);

            } catch (error) {
                console.error('Error fetching page data:', error.message);
                console.error(error.stack);
                pageData.urlResults = []

                setPageErrors(error.message)
                setIsLoadingUrls(false);
            }

        }

        fetchAuxPageData()

    },   [
        myIariBase,
        pageData,
    ])


    const handleViewOptionChange = (event) => {
        setSelectedViewOption(event.target.value);
    };

    const viewOptions = {
        "json": {
            key: "json",
            caption: "JSON"
        },
        "urls": {
            key: "urls",
            caption: "URLs"
        },
        "other": {
            key: "other",
            caption: "Other Types of Data (yet to be implemented)"
        },
    }

    const viewOptionsDisplay = <div className={"view-options-selection"}>
        <div className={'list-label'}>View Options:</div>
        {Object.entries(viewOptions)
            .filter(([_, opt]) => opt.enabled !== false) // filter out disabled
            .map(([viewOptionKey, opt]) => (
                <div key={viewOptionKey} >
                    <label>
                        <input
                            type="radio"
                            value={viewOptionKey}
                            checked={selectedViewOption === viewOptionKey}
                            onChange={handleViewOptionChange}
                        /> <span className={selectedViewOption === viewOptionKey ? 'selected-choice' : '' }>{opt.caption}</span>
                    </label>
                </div>
            ))}
    </div>

    if (!pageData) return null;

    const getErrorDisplay = (errors) => {
        if (!errors) return null

        if (typeof errors === "string") {
            return (errors.length > 1) ? <div className={"error-display"}>{errors}</div> : null
        }
        if (Array.isArray(errors)) {
            return <div className={"error-display error-display-many"}>
                {(errors.length === 1)
                    ? errors[0]
                    : <>
                        <div className={"title"}>Errors:</div>
                        {errors.map((s,i) => {
                            return <div key={i}>{i + 1}: {s}</div>
                        })}
                    </>
                }
            </div>
        }
        return null
    }

    const errorDisplay = getErrorDisplay(pageErrors)

    console.log(`PageDataGrok: rendering...${new Date().toISOString().slice(11, 23)}`)

    return <>
        {isLoadingUrls
            ? <Loader message={urlStatusLoadingMessage}/>
            : <>
                {errorDisplay}

                {!isDataReady
                    ? <p>Data Not Ready</p>

                    : <div className={"page-data iare-ux-container"}>

                        <div className={`iare-ux-header`}>
                            {showViewOptions && viewOptionsDisplay}
                        </div>

                        <div className={`iare-ux-body`}>
                            <div className={'page-data-wrapper'}>

                                {/*<p>Grok data goes here...</p>*/}

                                {/*{selectedViewOption === viewOptions['json'].key &&*/}
                                {/*    <RawJson json={pageData} />*/}
                                {/*}*/}

                                {selectedViewOption === viewOptions['json'].key &&
                                    <JsonEditor data={pageData}/>
                                }

                                {selectedViewOption === viewOptions['urls'].key &&
                                    <GrokDisplay pageData={pageData} options={{}}/>
                                }

                                {/*{selectedViewOption === 'debug' &&*/}
                                {/*    <>*/}
                                {/*        {testPageData()}*/}
                                {/*    </>*/}
                                {/*}*/}

                            </div>
                        </div>

                    </div>
                }
            </>
        }
    </>

}
