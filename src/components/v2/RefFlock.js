import React, {useEffect, useState, useContext} from 'react';
import RefView from "./RefView/RefView";
import {ConfigContext} from "../../contexts/ConfigContext";
import {Tooltip as MyTooltip} from "react-tooltip";
import {REF_LINK_STATUS_FILTERS as linkDefs} from "../../constants/refFilterMaps";
import {convertToCSV, copyToClipboard} from "../../utils/utils";
import MakeLink from "../MakeLink";

const baseWikiUrl = "https://en.wikipedia.org/wiki/" // for now TODO get from config or context or pageData

const handleCiteRefClick = (e) => {
    e.stopPropagation()
    window.open(e.currentTarget.href, "_blank")
}

function getReferenceCaption(ref) {

    let hasContent = false;

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
    // for each template, if there is a "doi" parameter, add it to the display
    ref.templates.forEach(t => {
        if (t.parameters?.doi) {
            hasContent = true
            const href = `https://doi.org/${encodeURIComponent(t.parameters.doi)}`
            doiLinks.push(<MakeLink href={href} linkText={`DOI: ${t.parameters.doi}`}/> )
        }
    })

    const markup = <>

        {ref.titles
            ? ref.titles.map( (t,i) => {
                hasContent = true
                return <span className={'ref-line ref-title'} style={{fontWeight: "bold"}}>{t}</span>
            }) : null }

        {ref.name
            ? <>
                {hasContent = true}
                <span className={'ref-line ref-name'}>Reference Name: <span style={{fontWeight: "bold"}}>{ref.name}</span></span>
              </>
            : null }

        {ref.template_names && ref.template_names.length
            ? <>
                {hasContent = true}
                {ref.template_names.map( tn => {
                return <span className={'ref-line ref-template'}>Template: <span style={{fontWeight: "bold"}}>{tn}</span></span>
            })}
                </>
            : null}

        {false && citeRefLinks}
        {doiLinks}

        {/*{ !hasContent ? <span>ref id: {ref.id}</span> : null }*/}
        { !hasContent ? <span>{ref.wikitext}</span> : null }

        {false && ref.link_status
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

    </>

    return markup
}

function RefFlock({ refArray, refFilterDef, onAction, extraCaption=null } ) {

    const [refDetails, setRefDetails] = useState(null);
    // const [isLoading, setIsLoading] = useState(false);
    const [tooltipHtmlRefList, setTooltipHtmlRefList] = useState( '<div>ToolTip<br />second line</div>' );

    const [openModal, setOpenModal] = useState(false)

    const myConfig = useContext(ConfigContext);
    const myIariBase = myConfig?.iariSource;
    // TODO catch undefined myIariBase exception

    let flockCaption, flockRows;


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

    const handleRemoveFilter = (e) => {

        // send action back up the component tree
        onAction( {
            "action": "removeReferenceFilter",
            "value": '',
        })
        // do we need to do anything local?
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


    if (!refArray) {
        flockCaption = <h4>No references!</h4>
        flockRows = null

    } else {
        // filter the refs if filter defined
        const filteredRefs = refFilterDef
            ? refArray.filter((refFilterDef.filterFunction)()) // Note self-calling function
            : refArray;

        const buttonRemove = refFilterDef
            ? <button onClick={handleRemoveFilter}
                 className={'utility-button'}
                 style={{position: "relative", top: "-0.1rem"}}
                ><span>Remove Filter</span></button>
            : null

        const handleCopyClick = () => { // used to copy url list and status

            // filter filteredRefs to only show footnote citations
            let refArrayData = filteredRefs.filter( r => {
                return r.type === "footnote" && r.footnote_subtype === "content"
            })

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

            // add column labels
            refArrayData.unshift( [
                'ref_index',
                'wari_id',
                'name',
                'title',
                'urls',
            ] )

            copyToClipboard(convertToCSV(refArrayData))

        }

        // flockCaption is a complicated algorithm to show filter definition contents
        flockCaption = <>
            {/*<h4>Applied Filter: {refFilterDef ? <div>{refFilterDef.desc}</div> : 'Show All'}</h4>*/}
            <h4><span className={"filter-title"}>Applied Filter:</span> {
                refFilterDef
                    ? (
                        refFilterDef?.lines
                            ? <div>{refFilterDef.lines[0]}<br/>{refFilterDef.lines[1]}</div>
                            : refFilterDef?.caption
                                ? <div>{refFilterDef.caption}</div>
                                : refFilterDef?.desc
                                    ? <div>{refFilterDef.desc}</div>
                                    : <div style={{fontStyle:"italic"}}>Invalid filter definition</div>
                    )
                    : "Show All"
            }</h4>
            <h4>{filteredRefs.length} {filteredRefs.length === 1
                ? 'Reference' : 'References'}{buttonRemove}</h4>
            {extraCaption}
        </>

        const buttonCopy = <button onClick={handleCopyClick} className={'utility-button small-button'} ><span>Copy to Clipboard</span></button>

        const listHeader = <div className={"ref-list-header"} >
            <div className={"list-header-row"}>
                <div className={"list-name"}>Reference {myConfig.isShowExpertMode && buttonCopy}</div>
            </div>
        </div>

        flockRows = <>
            {listHeader}
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
                       }}>{getReferenceCaption(ref)}</button>
                })}
            </div>
        </>

    }

    const refTooltip = <MyTooltip id="ref-list-tooltip"
                               float={true}
                               closeOnEsc={true}
                               delayShow={220}
                               variant={"info"}
                               noArrow={true}
                               offset={5}
                               className={"ref-list-tooltip"}
    />

    return <div className={"ref-flock"}>

        <div className={"ref-list-wrapper"}>
            {flockCaption}
            {flockRows}
        </div>

        <RefView details={refDetails} open={openModal} onClose={() => setOpenModal(false)} />

        {refTooltip}

    </div>
}

export default RefFlock;

