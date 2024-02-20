import React, {useState, useContext} from 'react';
import {ConfigContext} from "../../contexts/ConfigContext";
// import {Tooltip as MyTooltip} from "react-tooltip";
// import {REF_LINK_STATUS_FILTERS as linkDefs} from "../../constants/refFilterMaps";
import {convertToCSV, copyToClipboard} from "../../utils/utils";
import MakeLink from "../MakeLink";
import FlockBox from "../FlockBox";
import {ArticleVersions} from "../../constants/articleVersions";
import CitationDisplay_v1 from "./citations/CitationDisplay_v1";
import CitationDisplay_v2 from "./citations/CitationDisplay_v2";

const handleCiteRefClick = (e) => {
    e.stopPropagation()
    window.open(e.currentTarget.href, "_blank")
}

function RefFlock({ refArray, refFilter, onAction, pageData= {}, tooltipId=''} ) {

    // const [refDetails, setRefDetails] = useState(null);
    // const [isLoading, setIsLoading] = useState(false);
    const [tooltipHtmlRefList, setTooltipHtmlRefList] = useState( '<div>ToolTip<br />second line</div>' );

    // const [openModal, setOpenModal] = useState(false)

    const myConfig = useContext(ConfigContext);
    const isShowDebugInfo = !!myConfig?.isShowDebugInfo;  // NB double-negative to force boolean value
    // TODO catch undefined myIariBase exception


    const showRefView = (ref) => {
        onAction({action:"showRefViewForRef", value:ref})
        // TODO test to make sure passing the entire ref is ok, vs ref.id
    }

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

        // TODO: set timer for hover to wait, and then hover remove
        // html = "Click for Reference details"
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

    const filteredRows = filteredRefs.map((_ref, i) => {

        let referenceCaption = null

        if (pageData.iariArticleVersion === ArticleVersions.ARTICLE_V1.key) {
            referenceCaption = <CitationDisplay_v1 reference={_ref} index={i} />

        } else if (pageData.iariArticleVersion === ArticleVersions.ARTICLE_V2.key) {
            referenceCaption = <CitationDisplay_v2 reference={_ref} index={i} />
            // referenceCaption = getReferenceCaptionVersion2(ref, i, isShowDebugInfo)
        }

        return <button key={_ref.ref_id}
                       className={"ref-button"}
                       onClick={(e) => {
                           console.log ('ref clicked')
                           showRefView(_ref)
                       }}>{referenceCaption}</button>
    })

    const handleListClick= (e) => {
        console.log("handleClickList")
        e.preventDefault()
        // e.stopPropagation()

    }

    const flockList = <>
        {flockHeader}
        <div className={"ref-list"}
             // data-tooltip-id="ref-list-tooltip"
             data-tooltip-id={tooltipId}
             data-tooltip-html={tooltipHtmlRefList}
             onMouseOver={onHoverListItem}

             onClick={handleListClick}
        >
            {filteredRows}
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

        {flockList}

        {/*<RefView details={refDetails} open={openModal} onClose={() => setOpenModal(false)} />*/}

    </FlockBox>

}

export default RefFlock;

