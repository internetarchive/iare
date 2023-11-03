import React, {useCallback, useEffect, useState} from 'react';
import UrlFlock from "./UrlFlock";
import RefFlock from "./RefFlock";
import UrlOverview from "./UrlOverview";
import '../shared/urls.css';
import '../shared/filters.css';
// import {convertToCSV, copyToClipboard} from "../../utils/utils";
import {REF_LINK_STATUS_FILTERS} from "./filters/refFilterMaps";
import {URL_ACTION_FILTER_MAP} from "./filters/urlFilterMaps";
import {ConfigContext} from "../../contexts/ConfigContext";
import FilterButtons from "../FilterButtons";
import ChoiceFetch from "../ChoiceFetch";
import RefView from "./RefView/RefView";
// import {UrlStatusCheckMethods} from "../../constants/endpoints";

const localized = {
    "url_display_title":"URLs",
    "Actionable": "Actionable",
}

function ActionFilters( {filterSet= null, filterRender, flock = [], onAction, options = {}, currentFilterName = '', className = null}) {
    const handleActionable = (actionable) => {
        onAction({
            action: "setUrlActionFilter", value: actionable,
        })
    }

    return <FilterButtons
        flock={flock}  // flock set to count filters against
        filterMap={filterSet}
        onClick={handleActionable}
        caption={<>{localized.Actionable}<span className={"inferior"}> - These are the things that can be fixed right now</span></>}
        currentFilterName={currentFilterName}  // sets "pressed" default selection
        className={className}
        onRender={filterRender}  // how to render each button
    />

}



export default function UrlDisplay ({ pageData, options, urlStatusFilterMap= {}, urlArchiveFilterDefs = {} } ) {
    // pageData.urlArray is filtered and displayed
    // urlStatusFilterMap and urlArchiveFilterDefs describe available filters that we show here

    const [urlStatistics, setUrlStatistics] = useState({});
    const [urlFilters, setUrlFilters] = useState( null ); // keyed object of url filters to pass in to UrlFlock  TODO: implement UrlFilter custom objects
    const [refFilter, setRefFilter] = useState( null ); // filter to pass in to RefFlock
    const [selectedUrl, setSelectedUrl] = useState(''); // currently selected url in url list
    const [selectedUrlActionFilterName, setSelectedUrlActionFilterName] = useState('')
    const [selectedCitationType, setSelectedCitationType] = useState('')

    const [openModal, setOpenModal] = useState(false)
    const [refDetails, setRefDetails] = useState(null);

    const [showRefList, setShowRefList] = useState(false);

    let myConfig = React.useContext(ConfigContext);
    myConfig = myConfig ? myConfig : {} // prevents "undefined.<param>" errors
    const myIariBase = myConfig?.iariSource;


    // calculate url stats
    useEffect( () => {

        // calc counts for each filter of urlFilterMaps
        const urlCounts = (!pageData || !pageData.urlArray)
            ? []
            : Object.keys(urlStatusFilterMap).map(key => {
                const f = urlStatusFilterMap[key];
                const count = pageData.urlArray.filter((f.filterFunction)()).length; // Note the self-evaluating filterFunction!
                return {
                    label: f.caption + " (" + count + ")",
                    count: count,
                    link: key
                }
            })

        setUrlStatistics({urlCounts: urlCounts});

    }, [pageData, urlStatusFilterMap, urlArchiveFilterDefs, ])


    const fetchDetail = useCallback( (ref) => {
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
    // result is an object:
    //  {
    //      action: <action name>,
    //      value: <param value>
    //  }
    const handleAction = useCallback( result => {
        const {action, value} = result;
        console.log (`UrlDisplay: handleAction: action=${action}, value=${value}`);

        if (action === "setUrlStatusFilter") {
            // value is filter key name
            const f = value ? urlStatusFilterMap[value] : null
            setUrlFilters({ "url_status" : f })
        }

                    // if (action === "setArchiveStatusFilter") {
                    //     // TODO: this will eventually NOT take a filter index name, but rather a filter itself,
                    //     // TODO similar to action "setUrlReferenceFilter"
                    //     // value is filter key name
                    //     const f = value ? urlArchiveFilterMap[value] : null
                    //     setUrlFilters({ "archive_status" : f })
                    // }
                    //

        if (action === "showRefsForUrl") {
            // value is url key name
            const myRef = pageData.urlDict[value]?.refs[0] // for now...shall pass entire array soon
            fetchDetail(myRef)

            // also set Ref filter
            setRefFilter(getUrlRefFilter(value))

            setSelectedUrl(value)
        }

        if (action === "setArchiveStatusFilters") {
            setUrlFilters({ "archive_status" : value })  // NB: value is filter object
        }


        if (action === "setUrlReferenceFilter") {
            // filter References to those that contain a url specified by the value parameter
            setRefFilter(getUrlRefFilter(value))
            setSelectedUrl(value)
        }

        if (action === "setUrlActionFilter") {
            // filter References as determined by conditions set by chosen Action
            const f = value ? URL_ACTION_FILTER_MAP[value] : null
            setUrlFilters( { "action_filter": f } )
            setSelectedUrlActionFilterName(value)
        }

        if (action === "setLinkStatusFilter") {
            // use value as link status to filter references with

            const f = value ? REF_LINK_STATUS_FILTERS[value] : null
            setRefFilter(f)

            // TODO: some sort of feedback? selected filter?
        }

        if (action === "removeUrlFilter") {
            // clear filter (show all) for URL list
            setUrlFilters(null)
            setSelectedUrl(null)
            setSelectedUrlActionFilterName(null)
        }

        if (action === "removeReferenceFilter") {
            // clear filter (show all) for references list
            setRefFilter(null)
            setSelectedUrl(null)
        }


        // TODO: Action for setReferenceFilter/ShowReference for filtered URLS
        // i.e. show all refs that contain ANY of the URLS in the filtered URL list

    }, [urlStatusFilterMap, fetchDetail, pageData.urlDict])


    if (!pageData) return null;  /// NB must be put AFTER useEffect and useCallback, as these hooks cannot after conditional statements


    const handleCitationTypeChange = (e) => {
        const citationType = e.target.value
        console.log("Citation type changed to: " + citationType + ", take appropriate filter action")
        setSelectedCitationType(citationType)
    }



    const renderUrlActionButton = (props) => {
        /*
        callback for button render function of <FilterButton>
        expects:
            props.filter.caption
            props.filter.count
        */

        // TODO put in some element data for tooltip, like filter.desc
        // TODO Question: where does tool tip come from? is it generic tooltip for the page?
        return <>
            <div>{props.filter?.caption}</div>
            <div className={'filter-count'}>{props.filter?.count} items</div>
        </>
    }



    // TODO candidate for external shared function
    // TODO allow targetUrl(s) to be an array of Urls
    const getUrlRefFilter = (targetUrl) => {

        if (!targetUrl || targetUrl === '') {
            return null; // no filter means all filter
        }

        return {
            // TODO: implement UrlFilter custom object

            desc: `Citations with URL: ${targetUrl}`,

            caption: <span>Contains URL: <br/><span
                className={'target-url'}><a target={"_blank"} rel={"noreferrer"}
                href={targetUrl} >{targetUrl}</a
                ></span></span>,

            filterFunction: () => (d) => {
                // TODO make this use an array of targetUrls
                return d.urls.includes( targetUrl )
            },
        }
    }

    const citationTypes = {
        "footnotes": {
            caption: "Footnotes",
            value: "footnotes"
        },
        "sections": {
            caption: "General Sections",
            value: "sections"
        },
        "all": {
            caption: "All",
            value: "all"
        },
    }

    const refArray = (pageData.references)

    // const copyButton = <button onClick={handleCopyClick} className={'utility-button'} ><span>Copy to Clipboard</span></button>

    // const urlListCaption = <h3>URL List{myConfig.isDebug ? copyButton : null }</h3>
    const extraUrlCaption = <h4 style={{fontStyle:"italic",fontWeight:"bold"}}>Click a URL row to show References using that URL</h4>
    const extraRefCaption = <h4 style={{fontStyle:"italic",fontWeight:"bold"}}>Click on Reference to view details</h4>

    console.log("UrlDisplay: render");

    return <>

        <div className={"section-box"}>
            <h3>{localized.url_display_title}</h3>

            {false && <ChoiceFetch
                choices={citationTypes}
                selectedChoice={selectedCitationType}
                options={{
                    caption:"Show citations from: ",
                    className:"citation-choices"
                }}
                onChange={handleCitationTypeChange} />}

            <ActionFilters
                filterSet={URL_ACTION_FILTER_MAP}
                filterRender={renderUrlActionButton}
                flock={pageData.urlArray}
                onAction={handleAction}
                options ={{}}
                currentFilterName={selectedUrlActionFilterName}
                className={"url-action-filter-buttons"}
            />

            <UrlFlock urlArray={pageData.urlArray}
                      urlFilters={urlFilters}
                      onAction={handleAction}
                      selectedUrl={selectedUrl}
                      extraCaption={extraUrlCaption}
                      fetchMethod={myConfig.urlStatusMethod} />
        </div>

        <div className={"section-box url-overview-column"}>
            <h3>Filters</h3>
            <UrlOverview pageData={pageData} statistics={urlStatistics} onAction={handleAction}/>
        </div>


        {true && <div className={"section-box"}>
            <button className={"utility-button small-button button-show-ref-list"} style={{display:"inline-block"}}
                    onClick={() => {setShowRefList(prevState => !prevState)}}
            ><span>{showRefList ? 'Hide' : 'Show'} Reference List<br/><br/>This is temporary while the interface is being developed</span></button>


            {showRefList && <>
                <h3 style={{xxdisplay:"inline-block"}}>References List</h3>
                <RefFlock refArray={refArray} refFilterDef={refFilter} onAction={handleAction} extraCaption={extraRefCaption} />
            </>}
        </div>}


        <RefView details={refDetails} open={openModal} onClose={() => setOpenModal(false)} />

    </>
}
