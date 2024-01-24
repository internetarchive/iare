import React, {useState, useContext} from 'react';
import {ConfigContext} from "../../contexts/ConfigContext";
// import {Tooltip as MyTooltip} from "react-tooltip";
// import {REF_LINK_STATUS_FILTERS as linkDefs} from "../../constants/refFilterMaps";
import {convertToCSV, copyToClipboard} from "../../utils/utils";
import MakeLink from "../MakeLink";
import FlockBox from "../FlockBox";

const baseWikiUrl = "https://en.wikipedia.org/wiki/" // for now TODO get from config or context or pageData

const handleCiteRefClick = (e) => {
    e.stopPropagation()
    window.open(e.currentTarget.href, "_blank")
}

function getReferenceCaption(ref, i, showDebugInfo = false) {

    let hasContent = false;
    let spanCount = 0

    const citeRefLinks = ref.cite_refs
        ? ref.cite_refs.map( cr => {
            const citeRefLink = cr.href.replace( /^\.\//, baseWikiUrl)
            return <>
                <a href={citeRefLink} target={"_blank"} rel={"noreferrer"} onClick={handleCiteRefClick}>
                    <span className={"cite-ref-jump-link"}></span>
                </a>
            </>
        })
        : null // <div>No Citation Refs!</div>

    const doiLinks = []
    ref.templates.forEach( (t, ti) => {
        // for each template, if there is a "doi" parameter, add it to the display
        if (t.parameters?.doi) {
            hasContent = true
            const href = `https://doi.org/${encodeURIComponent(t.parameters.doi)}`
            doiLinks.push(<MakeLink href={href} linkText={`DOI: ${t.parameters.doi}`} key={`${ti}-${t.parameters.doi}`}/> )
        }
    })

    const setSpan = () => {
        hasContent = true
        spanCount++
    }

    const markup = <>

        {ref.titles
            ? ref.titles.map( (t) => {
                setSpan()
                return <span className={'ref-line ref-title'} key={spanCount} >{t}</span>
            }) : null }

        {ref.name
            ? <>
                {setSpan()}
                <span className={'ref-line ref-name'} key={spanCount}><span className={'caption'}>Reference Name:</span> {ref.name}</span>
              </>
            : null }

        {ref.template_names?.length
            ? <>
                {ref.template_names.map( tn => {
                    setSpan()
                    return <span className={'ref-line ref-template'} key={spanCount}><span className={'caption'}>Template:</span> {tn}</span>
            })}
                </>
            : null}

        {false && citeRefLinks}

        {doiLinks}

        { !hasContent ? <span>{ref.wikitext}</span> : null }

        {false && ref.link_status  // NB omit for now...
            // display link_status array values
            ? <div className={`ref-link-status-wrapper`}>

                {ref.link_status.length > 0
                    ? ref.link_status.map( linkStatus => {
                        // return <span className={'ref-line ref-status'}>Link Status: {linkStat}</span>
                        return <span className={`ref-link-status link-status-${linkStatus}`}
                            data-link-status={linkStatus}  />
                        })
                    : <span className={`ref-link-status link-status-missing`} /> }

            </div>
            : null}

        {showDebugInfo && <div> {/* extra info for debug */}
            #{i} {ref.id} {ref.type}-{ref.footnote_subtype}
        </div>}
    </>

    return markup
}

function RefFlock({ refArray, refFilter, onAction, pageData= {}, tooltipId=''} ) {

    // const [refDetails, setRefDetails] = useState(null);
    // const [isLoading, setIsLoading] = useState(false);
    const [tooltipHtmlRefList, setTooltipHtmlRefList] = useState( '<div>ToolTip<br />second line</div>' );

    // const [openModal, setOpenModal] = useState(false)

    const myConfig = useContext(ConfigContext);
    // const myIariBase = myConfig?.iariSource;
    const isShowDebugInfo = !!myConfig?.isShowDebugInfo;  // NB double-negative to force boolean value
    // TODO catch undefined myIariBase exception


    const showRefView = (ref) => {
        onAction({action:"showRefViewForRef", value:ref})
        // TODO test to make sure passing the entire ref is ok, vs ref.id
    }

                // useEffect( () => {
                //     // alert("will show new refDetails")
                //     setOpenModal(true)
                // }, [refDetails])  // triggered when refDetails changes

    // if no references to show...
    if (!refArray) {
        return <FlockBox caption={"References List"} className={"ref-flock"}>
            {"No references to show."}
        </FlockBox>
    }

    const onHoverListItem = e => {
        // show tool tip for link status icon


        let html = ''
                    // const linkStatus = e.target.dataset['linkStatus']
                    // if (linkStatus) {
                    //     html = `<div>${linkDefs[linkStatus]?.desc ? linkDefs[linkStatus]?.desc : "Unknown link status"}</div>`
                    // }

        html = "Click for Reference details"
        setTooltipHtmlRefList(html)
    }

    const filteredRefs = refFilter
        ? refArray.filter((refFilter.filterFunction)().bind(null, pageData.urlDict), ) // NB Note self-calling function
        : refArray;

    const handleCopyRefsClick = () => { // used to copy url list and status

        let refArrayData = filteredRefs

        // sort filtered refs and return fields per each ref
        refArrayData = refArrayData.sort(
            (a, b) => (a.ref_index > b.ref_index) ? 1 : (a.ref_index < b.ref_index) ? -1 : 0
        ).map( r => {
            return [
                r["ref_index"],
                r["id"],
                r["name"],
                r["titles"].join("+++"),
                r["urls"].join("+++"),
            ]
        })

        const numItems = refArrayData.length

        // add column labels
        refArrayData.unshift( [
            'ref_index',
            'wari_id',
            'name',
            'title',
            'urls',
        ] )

        copyToClipboard(convertToCSV(refArrayData), `${numItems} References`)

    }

    const buttonCopy = <button onClick={handleCopyRefsClick} className={'utility-button small-button'} ><span>Copy to Clipboard</span></button>

    const flockCaption = <>
        <div>References List</div>
        <div className={"sub-caption"}>
            <div>{filteredRefs.length} {filteredRefs.length === 1 ? 'Reference' : 'References'}</div>
            {buttonCopy}
        </div>
    </>

    const flockHeader = <div className={"ref-list-header"} >
        <div className={"list-header-row"}>
            <div className={"list-name"}>Reference</div>
        </div>
    </div>

    const flockRows = <>
        {flockHeader}
        <div className={"ref-list"}
             // data-tooltip-id="ref-list-tooltip"
             data-tooltip-id={tooltipId}
             data-tooltip-html={tooltipHtmlRefList}
             onMouseOver={onHoverListItem}
        >
            {filteredRefs.map((ref, i) => {
                return <button key={ref.id}
                   className={"ref-button"}
                   onClick={(e) => {
                       console.log ('ref clicked')
                       showRefView(ref)
                   }}>{getReferenceCaption(ref, i, isShowDebugInfo)}</button>
            })}
        </div>
    </>

                // const refTooltip = <MyTooltip id="ref-list-tooltip"
                //                            float={true}
                //                            closeOnEsc={true}
                //                            delayShow={220}
                //                            variant={"info"}
                //                            noArrow={true}
                //                            offset={5}
                //                            className={"ref-list-tooltip"}
                // />


    return <FlockBox caption={flockCaption} className={"ref-flock"}>

        {flockRows}

        {/*<RefView details={refDetails} open={openModal} onClose={() => setOpenModal(false)} />*/}

    </FlockBox>

}

export default RefFlock;

