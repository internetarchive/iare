import React, {useCallback, useState} from 'react';
import UrlFlock from "./UrlFlock";
import RefFlock from "./RefFlock";
import UrlOverview from "./UrlOverview";
import '../shared/urls.css';
import '../shared/components.css';
import {LINK_STATUS_MAP} from "../../constants/linkStatusMap";
import {ACTIONABLE_FILTER_MAP} from "../../constants/actionableMap";
import {REF_FILTER_DEFS} from "../../constants/refFilterMaps";
import {ConfigContext} from "../../contexts/ConfigContext";
import {rspMap} from "../../constants/perennialList";
import RefView from "./RefView/RefView";
// import {Tooltip as MyTooltip} from "react-tooltip";
import ConditionsBox from "../ConditionsBox";

export default function UrlDisplay ({ pageData, options, urlStatusFilterMap= {}, urlArchiveFilterMap = {} } ) {
    // TODO remove urlStatusFilterMap?

    const [urlFilters, setUrlFilters] = useState( null ); // keyed object of url filters to pass in to UrlFlock  TODO: implement UrlFilter custom objects
    const [refFilter, setRefFilter] = useState( null ); // filter to pass in to RefFlock
    const [selectedUrl, setSelectedUrl] = useState(''); // currently selected url in url list
    const [currentState, setCurrentState] = useState({})

    const [openModal, setOpenModal] = useState(false)
    const [refDetails, setRefDetails] = useState(null);

    const [currentConditions, setCurrentConditions] = useState([])

    let myConfig = React.useContext(ConfigContext);
    myConfig = myConfig ? myConfig : {} // prevents "undefined.<param>" errors
    const myIariBase = myConfig?.iariSource;

    /*
    for now, just replaces current condition with passed in condition.
    argument "condition" is assumed to be a filter definition, which, for
    functional purposes, must have a "category" and "desc" field,
    with an optional "fixit" field.  maybe down the line a "tooltip" field.
    */
    const setCondition = (newCondition) => {
        setCurrentConditions(newCondition)
    }

    // sets the current "state of the filters".
    // The filter boxes respond to currentState by adjusting their displayed state
    // if "whichFilter" is null, all filter states should be reset to null
    const setFilterState = (whichFilter, value) => {
        setCurrentState(prevState => {
            const newState = prevState
            Object.keys(prevState).forEach( state => {
                newState[state] = null
            })
            if (whichFilter?.key) newState[whichFilter.key] = value
            return newState
        })
    }

    const fetchReferenceDetail = useCallback( (ref) => {
        // handle null ref
        if (!ref) {
            setRefDetails("Trying to fetch invalid reference");
            return;
        }

        const myEndpoint = `${myIariBase}/statistics/reference/${ref.id}`;
        const data = ref
        data.endpoint = myEndpoint;
        setRefDetails(data);
        setOpenModal(true)
    }, [myIariBase])

    // callback from sub-components that induce actions upon flocks.
    // "result" parameter is an object consisting of:
    //  {
    //      action: <action name>,
    //      value: <param value>
    //  }
    //
    // most of these actions will set the flock filters to a current value.
    // Currently only one filter can be applied at a time.
    // Maybe later the capability of more than one filter will exist.
    const handleAction = useCallback( result => {
        const {action, value} = result;
        console.log (`UrlDisplay: handleAction: action=${action}, value=${value}`);
        const noneFilter = {
            "filter" : {
                filterFunction: () => () => {return false},
            }
        }
        const filters = {
            actionable: { key: "actionable" },
            link_status: { key: "link_status" },
            papers: { key: "papers" },
            perennial: { key: "perennial" },
            tld: { key: "tld" },
            books: { key: "books" },
            templates: { key: "templates" },
        }

        if (0) {
            // allows for easy addition of "else if"
        }
                    // else if (action === "setUrlStatusFilter") {  // soon to be deprecated
                    //     // value is filter key name
                    //     const f = value ? urlStatusFilterMap[value] : null
                    //     setUrlFilters({ "url_status" : f })
                    // }

        else if (action === "removeAll") {
            // clear filters (show all) for URL  and Refs list
            setUrlFilters(null)
            setRefFilter(null)
            setSelectedUrl(null)
            setFilterState(null)
            setCondition(null)
        }

        else if (action === "setActionableFilter") {
            // filter URL List by actionable filter determined by value as key
            const f = value ? ACTIONABLE_FILTER_MAP[value] : null

            setUrlFilters({"action_filter": f})
            setRefFilter(f?.refFilterFunction
                ? { filterFunction: f.refFilterFunction }
                : null)
            setFilterState(filters.actionable, value)
            setCondition(f)
        }

        else if (action === "setLinkStatusFilter") {
            // value is key into LINK_STATUS_MAP
            const f = value ? LINK_STATUS_MAP[value] : null
            setUrlFilters({ "link_status" : f })
            setRefFilter(f?.refFilterFunction
                ? { filterFunction: f.refFilterFunction }
                : null )
            setFilterState(filters.link_status, value)
            setCondition(f)
        }

        else if (action === "setPapersFilter") {
            // value is filter key name
            const f = value ? REF_FILTER_DEFS[value] : null
            setRefFilter(f)
            setUrlFilters(noneFilter)
            setFilterState(filters.papers, value)
            setCondition({category: "Papers", desc: `References with papers of type "${value}"`})
        }

        else if (action === "setPerennialFilter") {
            // value is perennial to filter by
            setUrlFilters({ "url_perennial_filter" : getUrlPerennialFilter(value) })
            setRefFilter(getRefPerennialFilter(value))
            setSelectedUrl(null)
            setFilterState(filters.perennial, value)
            setCondition({category: "Reliability", desc: `Links with Reliability Status of: "${rspMap[value].caption}"`})
        }

        else if (action === "setTldFilter") {
            // value is tld
            setUrlFilters({ "url_tld_filter" : getUrlTldFilter(value) })
            setRefFilter(getRefTldFilter(value))
            setSelectedUrl(null)
            setFilterState(filters.tld, value)
            setCondition({category: "Top Level Domain", desc: `Links with Top Level Domain of: "${value}"`})
        }

        else if (action === "setBooksFilter") {
            setUrlFilters({ "url_book_filter" : getUrlBooksFilter(value) })
            setRefFilter(getRefBooksFilter(value))
            setSelectedUrl(null)
            setFilterState(filters.books, value)
            setCondition({category: "Books", desc: `Links to books from "${value}"`})
        }

        else if (action === "setTemplateFilter") {
            // filter URLs (and references?) by template indicated by "value" argument
            setUrlFilters({ "url_template_filter" : getUrlTemplateFilter(value) })
            setRefFilter(getRefTemplateFilter(value))
            setSelectedUrl(null)
            setCondition({category: "Template", desc: `Utilizes template "${value}"`})
            setFilterState(filters.templates, value)
        }


        else if (action === "showRefsForUrl") {

            // value is url key name
            const myRef = pageData.urlDict[value]?.refs[0] // for now...shall pass entire array soon
            fetchReferenceDetail(myRef)

            // // NB disabling for now
            // // also set Ref filter
            // setRefFilter(getUrlRefFilter(value))

            setSelectedUrl(value)

        }


                        // else if (action === "setArchiveStatusFilters") {
                        //     setUrlFilters({ "archive_status_filter" : value })  // NB: value is filter object
                        // }


                        // else if (action === "setUrlReferenceFilter") {
                        //     // value parameter specifies url to filter References by
                        //     setRefFilter(getUrlRefFilter(value))
                        //     setSelectedUrl(value)
                        // }

        else {
            console.log(`Action "${action}" not supported.`)
            alert(`Action "${action}" not supported.`)
        }

                        // TODO: Action for setReferenceFilter/ShowReference for filtered URLS
                        // i.e. show all refs that contain ANY of the URLS in the filtered URL list

    }, [fetchReferenceDetail, pageData.urlDict])


    if (!pageData) return null;  /// NB must be put AFTER useEffect and useCallback, as these hooks cannot exist after conditional statements


                // // TODO eliminate!!
                // // TODO candidate for external shared function
                // // TODO allow targetUrl(s) to be an array of Urls
                // const getUrlRefFilter = (targetUrl) => {
                //
                //     if (!targetUrl || targetUrl === '') {
                //         return null; // no filter means all filter
                //     }
                //
                //     return {
                //         // TODO: implement UrlFilter custom object
                //
                //         desc: `Citations with URL: ${targetUrl}`,
                //
                //         caption: <span>Contains URL: <br/><span
                //             className={'target-url'}><a target={"_blank"} rel={"noreferrer"}
                //                                         href={targetUrl} >{targetUrl}</a
                //         ></span></span>,
                //
                //         filterFunction: () => (urlDict, ref) => {
                //             // TODO make this use an array of targetUrls
                //             return ref.urls.includes( targetUrl )
                //         },
                //     }
                // }

    const getUrlTemplateFilter = (templateName) => {

        if (!templateName || templateName === '') {
            return null; // no template means all filter
        }

        // return synthetic filter showing only URLs that have templateName in their associated citation templates
        return {

            desc: `URLs from References that contain Template "${templateName}"`,

            caption: <span>{`Contains Template "${templateName}"`}</span>,

            filterFunction: () => (url) => {
                // loop thru refs
                // if any of those refs contain templateName, return true anf exit
                if (!templateName?.length) return true  // always let URL in if templateName is empty
                return url.refs.some(r => {
                    // if any of the ref's templates contain the target templateName, return true...
                    if (!r.template_names) return false  // if ref does not have template_mames property...
                    return r.template_names.includes(templateName)  // return true of templateName represented
                })

            },
        }
    }

    const getUrlBooksFilter = (bookDomain) => {

        if (!bookDomain?.length) {
            return null; // no bookDomain means all filter
        }

        // return synthetic filter showing only URLs that have bookDomain as their netloc if contains cite book template
        return {

            desc: `URLs from References that contain "${bookDomain}" in a Cite Book template"`,

            caption: <span>{`Contains Books from "${bookDomain}"`}</span>,

            filterFunction: () => (url) => {
                if (!(url.reference_info.templates.includes("cite book"))) return false
                // return true if this url's netloc matches the bookDomain
                return (url.netloc === bookDomain)
            },
        }
    }

    const getRefBooksFilter = (bookDomain) => {
        if (!bookDomain?.length) {
            return null; // no bookDomain means all filter
        }
        return {
            filterFunction: () => (urlDict, ref) => {
                if (!ref.template_names.includes("cite book")) return false  // block if no book template
                return ref.urls.some( url => {
                    const urlObject = urlDict[url]
                    if (!urlObject?.netloc) return false  // block if no netloc

                    // TODO This is questionable

                    return (urlObject.netloc === bookDomain)
                })
            },
        }
    }

    const getUrlTldFilter = (tld) => {

        if (!tld || tld === '') {
            return null; // no template means all filter
        }

        // return synthetic filter showing only URLs that have specified tld
        return {
            desc: `URLs with Top Level Domain of "${tld}"`,
            caption: <span>{`Contains Top Level Domain "${tld}"`}</span>,
            filterFunction: () => (url) => {
                return url.tld === tld
            },
        }
    }

    const getRefTldFilter = (tld) => {
        if (!tld?.length) {
            return null; // no template means "all" filter
        }
        return {
            filterFunction: () => (urlDict, ref) => {
                return ref.urls.some( url => {
                    const urlObject = urlDict[url]
                    if (!urlObject?.tld) return false  // block if no tld
                    return urlObject.tld === tld
                })
            },
        }
    }

    const getUrlPerennialFilter = (perennialKey) => {
        if (!perennialKey || perennialKey === '') {
            return null; // null means "all" filter
        }
        // return synthetic filter showing URLs that have specified perennialKey in their rsp array
        return {
            desc: `URLs that contain Perennial "${perennialKey}"`,
            caption: <span>{`Contains Perennial "${perennialKey}"`}</span>,
            filterFunction: () => (url) => {
                // if (!perennialKey?.length) return true  // always let URL in if templateName is empty
                if (!url.rsp) return false  // if no rsp list for url, block it - it does not "belong"
                return url.rsp.includes(perennialKey)
            }
        }
    }

    // eslint-disable-next-line no-unused-vars
    const getRefPerennialFilter = (perennialKey) => {
        if (!perennialKey?.length) {
            return null; // null means "all" filter
        }
        return {
            filterFunction: () => (urlDict, ref) => {
                return ref.urls.some( url => {
                    const urlObject = urlDict[url]
                    if (!urlObject?.rsp) return false  // if no rsp list for url, block it - it does not "belong"
                    return urlObject.rsp.includes(perennialKey)
                })
            },
        }
    }

    const getRefTemplateFilter = (templateName) => {

        if (!templateName || templateName === '') {
            return null; // null filter means "select all" - show all if templateName is blank
        }

        // return synthetic filter showing only URLs that have templateName in their associated citation templates
        return {

            desc: `References that contain Template "${templateName}"`,

            caption: <span>{`Contains Template "${templateName}"`}</span>,

            filterFunction: () => (urlDict, ref) => {
                // loop thru refs
                // if any of those refs contain templateName, return true anf exit
                if (!templateName?.length) return true  // always let reference through if templateName is empty

                if (!ref.template_names) return false  // if ref does not have template_mames property...
                return ref.template_names.includes(templateName)  // return true of templateName represented

                            // return url.refs.some(r => {
                            //     // if any of the ref's templates contain the target templateName, return true...
                            //     if (!r.template_names) return false  // if ref does not have template_mames property...
                            //     return r.template_names.includes(templateName)  // return true of templateName represented
                            // })

            },
        }
    }


    const refArray = (pageData.references)

    console.log("UrlDisplay: render");


    // setup url stats

    // calc counts for each filter of url status filter maps
    const urlCounts = (!pageData?.urlArray?.length)
        ? []
        : Object.keys(urlStatusFilterMap).map(key => {
            const f = urlStatusFilterMap[key];
            const count = pageData.urlArray.filter((f.filterFunction)()).length; // Note the self-evaluating filterFunction!
            return {
                label: f.caption,
                count: count,
                link: key
            }
        })

    pageData.url_status_statistics = {urlCounts: urlCounts}


    return <>

        {myConfig.isShowUrlOverview &&
            <div className={"section-box url-overview-column"}>
                <UrlOverview pageData={pageData} options={{}} onAction={handleAction} currentState={currentState}/>
            </div>
        }


        <div className={"section-box"}>

            <ConditionsBox caption={"Conditions"} conditions={currentConditions} onAction={handleAction} />

            <div style={{display:"flex"}}>
                <UrlFlock urlArray={pageData.urlArray}
                          urlFilters={urlFilters}
                          onAction={handleAction}
                          selectedUrl={selectedUrl}
                          fetchMethod={myConfig.urlStatusMethod} />

                {myConfig.isShowReferences && /* References List may go away soon... */
                    // <div className={"section-box"}>
                        <RefFlock refArray={refArray} refFilter={refFilter} onAction={handleAction} pageData={pageData} />
                    // </div>
                }

            </div>
        </div>


        {/* this is the popup Reference Viewer component */}
        <RefView details={refDetails} open={openModal} onClose={() => setOpenModal(false)} />

    </>
}
