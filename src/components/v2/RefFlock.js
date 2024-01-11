import React, {useEffect, useState, useContext} from 'react';
import RefView from "./RefView/RefView";
import {ConfigContext} from "../../contexts/ConfigContext";
import {Tooltip as MyTooltip} from "react-tooltip";
import {REF_LINK_STATUS_FILTERS as linkDefs} from "../../constants/refFilterMaps";
import {convertToCSV, copyToClipboard} from "../../utils/utils";
import MakeLink from "../MakeLink";
import FlockBox from "../FlockBox";

const baseWikiUrl = "https://en.wikipedia.org/wiki/" // for now TODO get from config or context or pageData

const handleCiteRefClick = (e) => {
    e.stopPropagation()
    window.open(e.currentTarget.href, "_blank")
}

function getReferenceCaption(ref, i) {

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

        {false && <div> {/* extra info for debug */}
            #{i} {ref.id} {ref.type}-{ref.footnote_subtype}
        </div>}
    </>

    return markup
}

function RefFlock({ refArray, refFilter, onAction, pageData= {}} ) {

    const [refDetails, setRefDetails] = useState(null);
    // const [isLoading, setIsLoading] = useState(false);
    const [tooltipHtmlRefList, setTooltipHtmlRefList] = useState( '<div>ToolTip<br />second line</div>' );

    const [openModal, setOpenModal] = useState(false)

    const myConfig = useContext(ConfigContext);
    const myIariBase = myConfig?.iariSource;
    // TODO catch undefined myIariBase exception


    const fetchDetail = (ref) => {
        // handle null ref
        if (!ref) {
            setRefDetails("Trying to fetch invalid reference");
            return;
        }

        const myEndpoint = `${myIariBase}/statistics/reference/${ref.id}`;
        const data = ref
        data.endpoint = myEndpoint;
        setRefDetails(data);  // use reference data direct from page data, rather than fetching it again fresh from source
        setOpenModal(true)

        // // TODO: we do NOT do a force refresh of ref data here; instead we get it from ref list that came with article page data
        // // TODO: do we want to use refresh here? respect a refresh flag?
        // const myEndpoint = `${myIariBase}/statistics/reference/${ref.id}`;
        //
        // // fetch the data
        // fetch(myEndpoint, {
        // })
        //
        //     .then((res) => {
        //         if(!res.ok) throw new Error(res.status);
        //         return res.json();
        //     })
        //
        //     .then((data) => {
        //         data.endpoint = myEndpoint;
        //         data.link_status = ref.link_status
        //         data.citeRef = 'TEMP'  // ref.cite_ref ? ref.cite_ref : '?'
        //         setRefDetails(data);
        //     })
        //
        //     .catch((err) => {
        //         setRefDetails(`Error with details (${err})`);
        //     })
        //
        //     .finally(() => {
        //         // console.log("fetch finally")
        //     });

    }

    useEffect( () => {
        // alert("will show new refDetails")
        setOpenModal(true)
    }, [refDetails])

    // return if no references to show
    if (!refArray) {
        return <FlockBox caption={"References List"} className={"ref-flock"}>
            {"No references to show."}
        </FlockBox>
    }

    const onHoverListItem = e => {
        // show tool tip for link status icon

        const linkStatus = e.target.dataset['linkStatus']

        let html = ''
        if (linkStatus) {
            html = `<div>${linkDefs[linkStatus]?.desc ? linkDefs[linkStatus]?.desc : "Unknown link status"}</div>`
        }

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
             data-tooltip-id="ref-list-tooltip"
             data-tooltip-html={tooltipHtmlRefList}
             onMouseOver={onHoverListItem}
        >
            {filteredRefs.map((ref, i) => {
                return <button key={ref.id}
                   className={"ref-button"}
                   onClick={(e) => {
                       console.log ('ref clicked')
                       fetchDetail(ref)
                   }}>{getReferenceCaption(ref, i)}</button>
            })}
        </div>
    </>

    const refTooltip = <MyTooltip id="ref-list-tooltip"
                               float={true}
                               closeOnEsc={true}
                               delayShow={220}
                               variant={"info"}
                               noArrow={true}
                               offset={5}
                               className={"ref-list-tooltip"}
    />


    return <FlockBox caption={flockCaption} className={"ref-flock"}>

        {flockRows}

        <RefView details={refDetails} open={openModal} onClose={() => setOpenModal(false)} />

        {refTooltip}

    </FlockBox>

}

export default RefFlock;

