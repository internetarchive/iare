import React, {useEffect, useRef, useState} from 'react';
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

function RefFlock({ pageData= {},
                      refArray,
                      refFilter,
                      selectedRefIndex=null,

                      onAction,
                      options = {},
                      tooltipId='',
                      } ) {

    if (options.context) console.log("RefFlock: component entrance")

    const [tooltipHtmlRefList, setTooltipHtmlRefList] = useState( '<div>ToolTip<br />second line</div>' );

    // TODO catch undefined myIariBase exception

    const flockListRef = useRef(null);
    const targetItemRef = useRef(null);

    // scrolls selected reference element into view
    useEffect(() => {
        const container = flockListRef.current;
        const target = targetItemRef.current;
        if (container && target) {
            target.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" })
        }
    });  // no dependencies means runs upon EVERY render

    // const flockRef = React.useRef(null)
    //
    // React.useEffect(() => {
    //     // Focus on the element when the component mounts to ensure keystrokes get focused
    //     flockRef.current.focus();
    // }, []); // Empty dependency array ensures this effect runs only once after the initial render

    React.useEffect(() => {
        // Focus on the element when the component mounts to ensure keystrokes get focused
        if (options?.context) flockListRef.current.focus();
    }, []); // Empty dependency array ensures this effect runs only once after the initial render

    const handleKeyDown = (event) => {

        if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
            event.stopPropagation()
            event.preventDefault()
            // ??? event.preventDefault()
            console.log(`RefFlock: handleKeyDown (context: ${options?.context}): selectedRefIndex: ${selectedRefIndex}, arrowLeft or arrowUp`)
            handleNavPrev()

        } else if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
            event.stopPropagation()
            event.preventDefault()
            console.log(`RefFlock: handleKeyDown (context: ${options?.context}): selectedRefIndex: ${selectedRefIndex}, arrowRight or arrowDown`)
            handleNavNext()
        }

    };

    const handleListClick= (e) => {
        console.log("handleClickList")
        e.preventDefault()  // prevents internal <a> links from jumping automatically

        const refIndex = e.target.closest('button.ref-button').dataset["ref_index"]

        // send action up the calling component tree
        onAction( {
            "action": "referenceClicked",
            "value": refIndex,
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

    const handleCopyRefsClick = () => { // used to copy url list and status

        let refArrayData = filteredRefs

        // sort filtered refs by order they arrived from source
        // and return fields forr each ref
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

    const handleNavPrev = () => {
        console.log(`RefFlock: handleNavPrev (context: ${options?.context}) (from ${selectedRefIndex}) `)
        // get index from current selectedRefIndex
        const index = filteredRefs.findIndex(_ref => parseInt(_ref.ref_index) === parseInt(selectedRefIndex))
        if (index < 0) return  // if for some reason index not found for refIndex, bail
        if (index === 0) return  // if index is 0, we cannot go previous
        const newRefIndex = filteredRefs[index - 1].ref_index
        // send action up the calling component tree
        onAction( {
            "action": "referenceClicked",
            "value": newRefIndex,
        })

    }

    const handleNavNext = () => {
        console.log(`RefFlock: handleNavNext (context: ${options?.context}) (from ${selectedRefIndex}) `)
        // get index from current selectedRefIndex
        const index = filteredRefs.findIndex(_ref => parseInt(_ref.ref_index) === parseInt(selectedRefIndex))
        if (index < 0) return  // if for some reason index not found for refIndex, bail
        if (index === (filteredRefs.length -1)) return  // if we are at end of array, no "next"
        const newRefIndex = filteredRefs[index + 1].ref_index
        // send action up the calling component tree
        onAction( {
            "action": "referenceClicked",
            "value": newRefIndex,
        })
    }

    const refNavigation = options.show_ref_nav
        ? <div className={"ref-list-navigation"} >
            <button onClick={handleNavPrev} className={'utility-button small-button'} ><span>Prev</span></button>
            <button onClick={handleNavNext} className={'utility-button small-button'} ><span>Next</span></button>
        </div>
        : null

    const filteredRefs = refFilter
        ? refArray.filter((refFilter.filterFunction)().bind(null, pageData.urlDict), ) // NB Note self-calling function
        : refArray;

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
        {refNavigation}
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

        const isSelected = (
            selectedRefIndex !== undefined
            && selectedRefIndex !== null
            && (selectedRefIndex.toString() === _ref.ref_index.toString())
        )

        let className=`ref-button${isSelected ? ' selected' : ''}`

        return isSelected
            // we set a "ref" value of this is the targeted one - it allows us to scroll into view
            ? <button ref={targetItemRef}
                      key={_ref.ref_index}
                      className={className}
                      data-ref_index={_ref.ref_index}
                      data-ref={_ref}
                      data-array-index={i}
            >{referenceCaption}</button>

            : <button key={_ref.ref_index}
                      className={className}
                      data-ref_index={_ref.ref_index}
                      data-ref={_ref}
                      data-array-index={i}
            >{referenceCaption}</button>
    })

    /*
    within a reference display, there may be links from the original citation.
    fully resolved links, with https// will work fine, but there
    are probably many relative links relative to wikipedia that
    wont work here, as they will be relative to the top if IARE.

    Also, if the link is not an external reference, i imagine we want to carry thru
    the default action of exposing the reference detaiuls in the referee sectoin

    this is accomplished by propagating up the "message event" to display
    the details for the reference clicked.

    SO, in conclusion, we will always just find the surrounding ref button, and
    pass back up the "showRefDetails(refId)" message (or, selectReferenceId")
    */

    const flockList = <>
        {flockListHeader}
        <div className={"ref-list"}
             ref={flockListRef}

             // data-tooltip-id="ref-list-tooltip"
             data-tooltip-id={tooltipId}
             data-tooltip-html={tooltipHtmlRefList}
             onMouseOver={onHoverListItem}
             onClick={handleListClick}
        >
            {filteredRows}
        </div>
    </>

    // only log if the context is specified...otherwise ignore
    if (options.context) console.log(`RefFlock: component: before render return (context: ${options?.context}): selectedRefIndex: ${selectedRefIndex}, refFilter: ${refFilter?.caption}`)

    return <FlockBox onKeyDown={options?.show_ref_nav ? handleKeyDown : null}
                     caption={flockCaption}
                     className={"ref-flock"}>
    {/*return <FlockBox caption={flockCaption} className={"ref-flock"}>*/}

        {flockList}

        {/*<RefView details={refDetails} open={openModal} onClose={() => setOpenModal(false)} />*/}

    </FlockBox>

}

export default RefFlock;

