import React, {useCallback, useEffect, useState} from "react";

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

    const [selectedViewOption, setSelectedViewOption] = useState(viewOption)
    const pageData = rawPageData  // TODO why this reassign??
    const [pageErrors, setPageErrors] = useState('')


    const handleViewOptionChange = (event) => {
        setSelectedViewOption(event.target.value);
    };

    const viewOptions = {
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
        {errorDisplay}

        <div className={"page-data iare-ux-container"}>

            <div className={`iare-ux-body`}>
                <div className={'page-data-wrapper'}>

                    <p>Grok data will go here!</p>


                    {/*{selectedViewOption === viewOptions['urls'].key &&*/}
                    {/*    <GrokDisplay pageData={pageData} options={{}}/>*/}
                    {/*}*/}

                </div>

            </div>
        </div>
    </>
}
