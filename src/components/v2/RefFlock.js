import React, {useState} from 'react';
import {ArticleVersions} from "../../constants/articleVersions";
import {convertToCSV, copyToClipboard} from "../../utils/utils";
import CitationDisplay_v1 from "./citations/CitationDisplay_v1";
import CitationDisplay_v2 from "./citations/CitationDisplay_v2";
import FilterConditionBox from "../FilterConditionBox";
import FlockBox from "../FlockBox";

            // const handleCiteRefClick = (e) => {
            //     e.stopPropagation()
            //     window.open(e.currentTarget.href, "_blank")
            // }

function RefFlock({ refArray,
                      refFilter,
                      pageData= {},
                      onAction,
                      selectedReferenceId=null,
                      options = {},
                      tooltipId=''} ) {

    const [tooltipHtmlRefList, setTooltipHtmlRefList] = useState( '<div>ToolTip<br />second line</div>' );

    // TODO catch undefined myIariBase exception

    const handleListClick= (e) => {
        console.log("handleClickList")
        e.preventDefault()  // prevents internal a links from jumping automatically

        const refId = e.target.closest('button.ref-button').dataset["ref_id"]
        // const myRef = e.target.closest('button.ref-button').dataset["ref"]

        // alert(`will take action on refId ${refId}`)

        // send action back up the component tree
        onAction( {
            "action": "referenceClicked",
            "value": refId,
        })

    }


    // if no references to show...
    if (!refArray) {
        return <FlockBox caption={"References List"} className={"ref-flock"}>
            {/*{"No references to show."}*/}
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

    const filterDescription = options.show_filter_description
        ? <div className={"ref-list-filter-desc"} >
            <FilterConditionBox filter={refFilter} />
        </div>
        : null

    const buttonCopy = <button onClick={handleCopyRefsClick} className={'utility-button small-button'} ><span>Copy to Clipboard</span></button>

    const flockCaption = <>
        <div>References List</div>
        <div className={"sub-caption"}>
            <div>{filteredRefs.length} {filteredRefs.length === 1 ? 'Reference' : 'References'}</div>
            {buttonCopy}
        </div>
        {filterDescription}
    </>

    const flockListHeader = options.hide_header
        ? null
        : <div className={"ref-list-header"} >
            <div className={"list-header-row"}>
                <div className={"list-name"}>Reference</div>
            </div>
        </div>

    const filteredRows = filteredRefs.map((_ref, i) => {

        let referenceCaption = null

        if (pageData.iariArticleVersion === ArticleVersions.ARTICLE_V1.key) {
            // eslint-disable-next-line react/jsx-pascal-case
            referenceCaption = <CitationDisplay_v1 reference={_ref} index={i} />

        } else if (pageData.iariArticleVersion === ArticleVersions.ARTICLE_V2.key) {
            // eslint-disable-next-line react/jsx-pascal-case
            referenceCaption = <CitationDisplay_v2 options={options} reference={_ref} index={i} />
            // referenceCaption = getReferenceCaptionVersion2(ref, i, isShowDebugInfo)
        }

        return <button key={_ref.ref_id}
                       className={"ref-button"}
                       data-ref_id={_ref.ref_id}
                       data-ref={_ref}
                       // onClick={(e) => {
                       //     console.log ('ref clicked')
                       //     showRefView(_ref)
                       // }}
                    >{referenceCaption}</button>
    })

    /*
    within a reference display, there may be links from the original citation.
    fully resolved links, with https// will work fine, but there
    are probably many relative links relative to wikipedia that
    wont work here, as they will be relative to the top if IARE.

    Also, if the link is not an external reference, i imagine we want to carry thru
    the default action of exposing the reference detaiuls in the referee sectoin

    this is accomplished by propogating up the "message event" to display
    the details for the reference clicked.

    SO, in conclusion, we will alwyas just find the surrounding ref button, and
    pass back up the "showRefDetails(refId)" message (or, selecteReferenceId")
    */

    const flockList = <>
        {flockListHeader}
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

    console.log(`RefFlock: render flock, refFilter: ${refFilter?.caption}`)
    return <FlockBox caption={flockCaption} className={"ref-flock"}>

        {flockList}

        {/*<RefView details={refDetails} open={openModal} onClose={() => setOpenModal(false)} />*/}

    </FlockBox>

}

export default RefFlock;

