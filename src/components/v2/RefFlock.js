import React, {useEffect, useState, useContext} from 'react';
import RefView from "./RefView/RefView";
import {ConfigContext} from "../../contexts/ConfigContext";
import {Tooltip as MyTooltip} from "react-tooltip";
import {REF_LINK_STATUS_FILTERS as linkDefs} from "./filters/refFilterMaps";

function getReferenceCaption(ref) {

    let hasContent = false;

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

        {ref.reference_count && ref.reference_count > 1
            ? <>
                {hasContent = true}
                <span className={'ref-line ref-count'}>Reference used {ref.reference_count} times</span>
            </>
            : null}

        {/*{ !hasContent ? <span>ref id: {ref.id}</span> : null }*/}
        { !hasContent ? <span>{ref.wikitext}</span> : null }

        {ref.link_status
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
    // TODO catch myIariBase being undefined

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

        //
        // // TODO: use refresh here ?
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

    let refs, caption;

    if (!refArray) {
        caption = <h4>No references!</h4>
        refs = null

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

        caption = <>
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

        const listHeader = <div className={"ref-list-header"} >
            <div className={"list-header-row"}>
                <div className={"list-name"}>Reference</div>
            </div>
        </div>

        refs = <>
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
            {caption}
            {refs}
        </div>

        <RefView details={refDetails} open={openModal} onClose={() => setOpenModal(false)} />

        {refTooltip}

    </div>
}

export default RefFlock;