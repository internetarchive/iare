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
import RefView from "./refView/RefView";
import {Tooltip as MyTooltip} from "react-tooltip";
import ConditionsBox from "../ConditionsBox";
import {REFERENCE_STATS_MAP} from "../../constants/referenceStatsMap";
import {IARE_ACTIONS} from "../../constants/iareActions";

// export default function UrlDisplay ({ pageData, options, urlStatusFilterMap= {}, urlArchiveFilterMap = {} } ) {
export default function UrlDisplay ({ pageData, options } ) {

    const [urlFilters, setUrlFilters] = useState( null ); // keyed object of url filters to pass in to UrlFlock  TODO: implement UrlFilter custom objects
    const [refFilter, setRefFilter] = useState( null ); // filter to pass in to RefFlock
    const [selectedUrl, setSelectedUrl] = useState(''); // currently selected url in url list
    const [currentState, setCurrentState] = useState({})

    const [openModal, setOpenModal] = useState(false)
    // const [refDetails, setRefDetails] = useState(null);
    const [selectedRefId, setSelectedRefId] = useState(null);

    const [currentConditions, setCurrentConditions] = useState([])

    const filters = {
        actionable: { key: "actionable" },
        reference_stats: { key: "reference_stats" },
        domains: { key: "domains" },
        link_status: { key: "link_status" },
        papers: { key: "papers" },
        perennial: { key: "perennial" },
        tld: { key: "tld" },
        books: { key: "books" },
        templates: { key: "templates" },
    }

    let myConfig = React.useContext(ConfigContext);
    myConfig = myConfig ? myConfig : {} // prevents "undefined.<param>" errors

    /*
    for now, just replaces current condition with passed in condition.
    argument "condition" is assumed to be a filter definition, which, for
    functional purposes, must have a "category" and "desc" field,
    with an optional "fixit" field.  maybe down the line a "tooltip" field.
    */
    const setCondition = (newCondition) => {
        setCurrentConditions(newCondition)
    }

    // sets the current "state of the filters". Each filter has its own
    // state of what it's current "value" is that it is filtering upon.
    // The filter boxes respond to currentState by adjusting the displayed state.
    // If "whichFilter" is null, all filter states reset to null
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

    /*
    show modal refView
    - refFilter should already be set
    - selectedRefId should be respected
    - set modal to "show"
     */
    const showRefView = useCallback( (refId) => {
        // cancel any current tooltip
        // FIXME

        // handle null ref
        if (!refId) {
            alert(`urlDisplay: showRefView, refId is null!`)
            // setSelectedRefId(ref.ref_id);  // default ref to select in popup
            // setRefDetails("Trying to fetch empty reference");
            // TODO alert patron or show modal anyway?
            return;
        }

        // alert(`urlDisplay: showRefView, ref id is: ${refId}`)
        // setRefDetails(ref);
        // setSelectedRefId(ref.ref_id);  // default ref to select in popup
        setSelectedRefId(refId);  // default ref to select in popup
        setOpenModal(true)

    }, [])

    // callback from sub-components that induce various actions.
    //
    // "result" parameter is an object consisting of:
    //  {
    //      action: <action name>,
    //      value: <value to act upon, if any>
    //  }
    //
    // Most actions set the flock filters to a current value.
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

        else if (action === IARE_ACTIONS.FILTER_BY_REFERENCE_STATS.key) {
            // filter URL List by actionable filter determined by value as key
            const f = value ? REFERENCE_STATS_MAP[value] : null
            setRefFilter(f?.refFilterFunction
                ? { filterFunction: f.refFilterFunction }
                : null)
            setFilterState(filters.reference_stats, value)  // select reference stat's filter value
            setCondition(f)
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

        else if (action === "setDomainFilter") {
            // filter URL and Ref list by domain specified in value
            setUrlFilters({ "domain_filter" : getUrlDomainFilter(value) })
            setRefFilter(getRefDomainFilter(value))
            setFilterState(filters.domains, value)
            setCondition({category: "Pay Level Domains", desc: `Links of domain: "${value}"`})
        }

        else if (action === "setLinkStatusFilter") {
            // value is key into LINK_STATUS_MAP
            const f = value ? LINK_STATUS_MAP[value] : null
            setUrlFilters({ "link_status" : f })
            setRefFilter(f?.refFilterFunction
                ? { caption: f.caption,
                    desc: f.desc,
                    filterFunction: f.refFilterFunction
                }
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


        else if (action === "showRefViewForUrl") {

            // value is url key name
            const myRef = pageData.urlDict[value]?.refs[0]
            // for now...eventually shall pass entire ref array so that refView
            // shows a list of references to scroll with
            showRefView(myRef)

            // // NB disabling for now
            // // also set Ref filter
            // setRefFilter(getUrlRefFilter(value))
            setSelectedUrl(value)
        }

        else if (action === IARE_ACTIONS.SHOW_REFERENCE_VIEWER.key) {
            const myRefId = value  // value is reference id
            showRefView(myRefId)
        }

        else {
            console.log(`Action "${action}" not supported.`)
            alert(`Action "${action}" not supported.`)
        }

        // TODO: Action for setReferenceFilter/ShowReference for filtered URLS
        // i.e. show all refs that contain ANY of the URLS in the filtered URL list

    }, [showRefView, pageData.urlDict])

    if (!pageData) return null;  // NB must be put AFTER useEffect and useCallback, as those hooks
                                 //    cannot exist after conditional statements

    const getUrlTemplateFilter = (templateName) => {

        if (!templateName || templateName === '') {
            return null; // no template means all filter
        }

        // return synthetic filter showing only URLs that have templateName in their associated citation templates
        return {

            desc: `URLs from References that contain Template "${templateName}"`,

            caption: <span>{`Contains Template "${templateName}"`}</span>,

            filterFunction: () => (url) => {
                if (!url.refs) return false
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
            desc: `References with Links with Top Level Domain of "${tld}"`,
            caption: <span>{`Contains Links with Top Level Domain "${tld}"`}</span>,
            filterFunction: () => (urlDict, ref) => {
                return ref.urls.some( url => {
                    const urlObject = urlDict[url]
                    if (!urlObject?.tld) return false  // block if no tld
                    return urlObject.tld === tld
                })
            },
        }
    }

    const getUrlDomainFilter = (targetDomain) => {

        if (!targetDomain?.length) {  // targetDomain is falsey or empty string
            return null; // null means "all" filter
        }

        return {
            caption: `Contains ${targetDomain} domain`,
            desc: `Link contains domain: ${targetDomain}`,
            filterFunction: () => (url) => {
                return url?.pay_level_domain === targetDomain
                // return url?.netloc === targetDomain
            },
        }

    }

    const getRefDomainFilter = (targetDomain) => {

        if (!targetDomain?.length) {  // targetDomain is falsey or empty string
            return null; // null means "all" filter
        }

        return {
            caption: `Contains ${targetDomain} domain`,
            desc: `Reference contains links that contain domain: ${targetDomain}`,
            filterFunction: () => (urlDict, ref) => {
                return ref.urls.some( url => {
                    // const urlObject = urlDict[url]?
                    // return urlObject?.netloc === targetDomain
                    return urlDict[url]?.pay_level_domain === targetDomain
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
            desc: `References with Links that contain Perennial "${perennialKey}"`,
            caption: <span>{`Contains Links with Perennial "${perennialKey}"`}</span>,
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

    const handleRefClick = (result) => {
        // value is reference (or reference id?)(or ref index?)
        // action should be "referenceClicked"
        if (result.action === "referenceClicked") {
            const refId = result.value
            // alert(`Reference clicked - will show RefView with current filter and selected refid of: ${refId}`)
            // pass up to local handler
            handleAction({"action":IARE_ACTIONS.SHOW_REFERENCE_VIEWER.key, value:refId})
            // NB I know this is redundant, but leaving ot this way in case we want to
            //  massage any of the data before passing it to RefView
        }
    }


    const refArray = (pageData.references)

    console.log(`UrlDisplay: render; refFilter.caption = ${refFilter?.caption}`);


    const tooltipUrlDisplay = <MyTooltip id="url-display-tooltip"
                                    float={true}
                                    closeOnEsc={true}
                                    delayShow={420}
                                    variant={"info"}
                                    noArrow={true}
                                    offset={5}
                                    className={"url-display-tooltip"}
                                    style={{ zIndex: 999 }}
                            />

    return <>

        <div className={'section-content'}>

            {myConfig.isShowUrlOverview &&
                <div className={"section-box url-overview-column"}>
                    <UrlOverview pageData={pageData} options={{}} onAction={handleAction}
                                 currentState={currentState} tooltipId={"url-display-tooltip"}/>
                </div>
            }

            <div className={"section-box"}>

                <ConditionsBox caption={"Conditions"} conditions={currentConditions} onAction={handleAction}/>

                <div style={{display: "flex"}}>
                    <UrlFlock urlArray={pageData.urlArray}
                              urlFilters={urlFilters}
                              onAction={handleAction}
                              selectedUrl={selectedUrl}
                              fetchMethod={myConfig.urlStatusMethod}
                              tooltipId={"url-display-tooltip"}
                    />

                    <RefFlock pageData={pageData}
                              refArray={refArray}
                              refFilter={refFilter}
                              onAction={handleRefClick}
                              options={{hide_header:true, show_filter_description: false}}
                              tooltipId={"url-display-tooltip"}
                    />
                </div>

            </div>


            {/* this is the popup Reference Viewer component */}
            <RefView // refDetails={refDetails}
                     refFilter={refFilter}
                     selectedRefId={selectedRefId}
                     defaultRefId={selectedRefId}
                     pageData={pageData}
                     open={openModal}
                     onClose={() => setOpenModal(false)} tooltipId={"url-display-tooltip"}/>

            {tooltipUrlDisplay}

        </div>
    </>
}
