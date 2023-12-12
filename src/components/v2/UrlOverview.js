import React, {useState} from 'react'
import FilterButtons from "../FilterButtons";
import FilterStatusChoices from "../FilterStatusChoices";
import {ARCHIVE_STATUS_FILTER_MAP as archiveFilterDefs} from "./filterMaps/urlFilterMaps";
import {REF_LINK_STATUS_FILTERS} from "./filterMaps/refFilterMaps";
import {ConfigContext} from "../../contexts/ConfigContext";
import UrlStatusChart from "./charts/UrlStatusChart";
import TemplateChart from "./charts/TemplateChart";
import PerennialChart from "./charts/PerennialChart";
import TldChart from "./charts/TldChart";
import {
    Chart,
    LinearScale,
    BarElement,
    ArcElement,
    Legend,
    Tooltip,
    Title,
    SubTitle,
    Colors,
} from 'chart.js'

Chart.register(
    LinearScale,
    BarElement,
    ArcElement,
    Legend,
    Tooltip,
    Title,
    SubTitle,
    Colors,
);

const colors = {
    blue: "#35a2eb",
    red: "#ff6384",
    teal: "#4bc0c0",
    orange: "#ff9f40",
    purple: "#9866ff",
    yellow: "#ffcd57",
    grey: "#c9cbcf",
    magenta: "#f763ff",
}

const UrlOverview = React.memo(({pageData, options, onAction}) => {  // React.memo so doesn't re-rerender with param changes

    const [showCitationLinks, setShowCitationLinks] = useState(false)
    const [archiveFilterStatus, setArchiveFilterStatus] = useState(
        // this may be deprecated...
        {
            // iari: {
            //     yes: false,
            //     no: false,
            //     all: true
            // },
            iabot: {
                yes: false,
                no: false,
                all: true
            },
            template: {
                yes: false,
                no: false,
                all: true
            },
        }
    )

    let myConfig = React.useContext(ConfigContext);
    myConfig = myConfig ? myConfig : {} // prevents "undefined.<param>" errors

                // useEffect( () => {
                //
                //     console.log('filterStatus changed to:', archiveFilterStatus)
                //
                //     // create filters array based on archive status values
                //     let myFilters = []
                //     Object.keys(archiveFilterStatus).forEach( archiveSource => {
                //         Object.keys(archiveFilterStatus[archiveSource]).forEach( archiveStatus => {
                //             if (archiveFilterStatus[archiveSource][archiveStatus]) {
                //                 myFilters.push(archiveFilterDefs[archiveSource][archiveStatus])
                //             }
                //         })
                //     })
                //
                //     // activate the filters
                //     onAction({
                //         action: "setArchiveStatusFilters",
                //         value: {
                //             caption: "Unused Caption for multi filters",
                //             filterFunction: myFilters,
                //         },
                //     })
                //
                // }, [ archiveFilterStatus, onAction ])



                // // debug display for chartData
                // return <div>
                //     <h4>Urls</h4>
                //     <RawJson obj={chartData} />
                // </div>

    const handleLinkAction = (linkStatus) => {
        onAction({
            action: "setLinkStatusFilter", value: linkStatus,
        })
    }

    // callback for button render function of <FilterButton>
    const renderLinkStatusButton = (props) => {
        return <>
            {props.filter.lines.map( (line, i) => {
                return <div key={i}>{line}</div>
            })}
            <div className={`filter-link-status-wrapper`}>
                <span className={`link-status link-status-${props.filter.name}`} />
            </div>
            <div className={'filter-count'}>{props.filter.count}</div>
        </>
    }

    const linkStatusFilters = <>
        <h4 style={{fontStyle: "italic", fontWeight: "bold"}}>Click to filter References List</h4>
        <div className={"filters-link-status"}>
            <FilterButtons
                flock={pageData.references}
                filterMap={REF_LINK_STATUS_FILTERS}
                filterList={[]}
                onClick={(e) => {
                    handleLinkAction(e)
                }}
                caption=''
                className="link-status-filter-buttons"
                currentFilterName=''
                onRender={renderLinkStatusButton}
            />
        </div>
    </>


                // (deprecated) Link Status buttons

                // //
                // DO NOT DELETE - may recover this code and filter buttons later...
                // //
                // const handleArchiveStatusAction = (archiveStatus) => {
                //     // alert(`handleArchiveStatusAction: action is ${archiveStatus}`)
                //     onAction({
                //         action: "setArchiveStatusFilter", value: archiveStatus,
                //     })
                // }
                // // callback for button render function of <FilterButton>
                // // NB: props.filter.name is magically set to object key name of filter
                // // NB: props.filter.count is magically set to count of number of items resulting from filter
                // // TODO: this should be made into a class, or something that takes a standard interface
                // const renderArchiveStatusButton = (props) => {
                //     return <>
                //         <div>{props.filter.caption}</div>
                //         <div className={`filter-archive-status-wrapper`}>
                //             <span className={`archive-status archive-status-${props.filter.name}`} />
                //         </div>
                //         <div className={'filter-count'}>{props.filter.count}</div>
                //     </>
                // }
                // const makeArchiveStatusFilters = () => {
                //     return (<>
                //         <FilterButtons
                //             flock={pageData.urlArray}
                //             filterMap={URL_ARCHIVE_STATUS_FILTER_MAP}
                //             filterList={[]}
                //             onClick={(e) => {
                //                 handleArchiveStatusAction(e)
                //             }}
                //             caption=''
                //             className="archive-status-filter-buttons"
                //             currentFilterName=''
                //             onRender={renderArchiveStatusButton}
                //         />
                //     </>)
                // }

    // Link Status filter

    const buttonShowHideLinkStats = <button
        onClick={() => setShowCitationLinks(!showCitationLinks)} className={"utility-button"}
        >{showCitationLinks ? "hide" : "show"}</button>

    const linkStatusCaption = <>
        <h4>Citation Link Statuses{buttonShowHideLinkStats}</h4>
    </>

    const archiveStatusCaption = <>
        <h4>URL Archive Statuses</h4>
    </>

    const handleArchiveStatusCheck = (e) => {

        const source = e.target.dataset['source']
        const status = e.target.dataset['status']
                //const checked = e.target.checked
                // const checked = true

        // if checked === true, make all other status in source false and this one true
        // if checked == false, make this one false; dont have to worry about others (doesnt hav eto be opposite, only
        //                      needs to have ONLY ONE true
        setArchiveFilterStatus(prevState => {

            let newSourceState = prevState[source]

            // falsify everything
            Object.keys(newSourceState).forEach(key => {
                newSourceState[key] = false;
            })

            // make this one special - turn it on; this makes it act like a radio button
            newSourceState[status] = true

            return {
                ...prevState,
                [source]: newSourceState
            }
        })
    }



    const buttonArchiveNoCite = <button
        onClick={() => setArchiveFilterStatus (
            {
                // iari: {
                //     yes: false,
                //     no: false,
                //     all: true
                // },
                iabot: {
                    yes: true,
                    no: false,
                    all: false
                },
                template: {
                    yes: false,
                    no: true,
                    all: false
                },
            }
        )}
        className={"utility-button shortcut-button no-left-margin"}
        >IABot archive not in Citation</button>


    const archiveStatusFiltersDisplay = <>
        <h4 style={{fontStyle: "italic", fontWeight: "bold"}}>Click to filter URLs by Archive Status</h4>

        <div>Shortcut: {buttonArchiveNoCite}</div>

        <div className={"filters-archive-status"}>
            <FilterStatusChoices filterDefs={archiveFilterDefs} filterStatus={archiveFilterStatus} handleClick={handleArchiveStatusCheck} />
        </div>
    </>






    return <div className={"url-overview"}>

        <div className={"row"}>

            <div className={"col col-6"}>
                <div className={'section-sub'}>
                    <UrlStatusChart pageData={pageData} options={{captionClass:"box-caption"}} colors={colors} onAction={onAction} />
                </div>

                <div className={'section-sub'}>
                    <PerennialChart pageData={pageData} options={{captionClass:"box-caption"}} onAction={onAction} />
                </div>

            </div>


            <div className={"col col-6"}>
                {myConfig.isShowNewFeatures &&
                    <div className={'section-sub'}>
                        <TldChart pageData={pageData} options={{captionClass:"box-caption"}} onAction={onAction} />
                    </div>
                }

                {myConfig.isShowNewFeatures &&
                    <div className={'section-sub'}>
                        <TemplateChart pageData={pageData} options={{captionClass:"box-caption"}} onAction={onAction} />
                    </div>
                }
            </div>

        </div>


        {false && <div className={'section-sub'}>
            {archiveStatusCaption}
            {archiveStatusFiltersDisplay}
        </div>}

        {false && <div className={'section-sub'}>
            {linkStatusCaption}
            {showCitationLinks ? linkStatusFilters : null}
        </div>}
    </div>

})

export default UrlOverview;