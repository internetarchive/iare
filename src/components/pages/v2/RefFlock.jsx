import React, {useEffect, useRef, useState} from 'react';
import {ParseMethods} from "../../../constants/parseMethods.jsx";
import {convertToCSV, copyToClipboard, iareAlert} from "../../../utils/generalUtils.js";
import CitationDisplayV1 from "./citations/CitationDisplayV1.jsx";
import CitationDisplayV2 from "./citations/CitationDisplayV2.jsx";
import FilterConditionBox from "../../FilterConditionBox.jsx";
import FlockBox from "../../FlockBox.jsx";
import {ConfigContext} from "../../../contexts/ConfigContext.jsx";
import copyDocumentsIcon from "@/images/icons/document_copy_icon.svg"
import tapestryIcon from "@/images/icons/tapestry.icon.v1r1.png"

import parseRefTapestry from '@/lib/tapestry-parser/parseRefTapestry'


const refFeedbackElement = "ref-feedback-element"

function RefFlock({ pageData= {},
                      refArray,
                      refFilter,
                      selectedRefIndex=null,
                      className=null,

                      onAction,
                      onKeyDown,

                      options = {},
                      tooltipId='',
                      } ) {

    let myConfig = React.useContext(ConfigContext);
    myConfig = myConfig ? myConfig : {} // prevents "undefined.<param>" errors

    const urlCount = pageData?.urlDict ? Object.keys(pageData.urlDict).length : 0

    console.log(`RefFlock: component entrance; pageData urlDict.length:${urlCount}`)

    let selectedArrayIndex = -1  // where in the filteredRefs list is our current array index (not refIndex, which is the "global index" of the reference
    const [tooltipHtmlRefList, setTooltipHtmlRefList] = useState(null )

    // TODO catch undefined myIariBase exception

    // refs used for low-level DOM element manipulation
    const flockListRef = useRef(null)
    const targetItemRef = useRef(null)

    // scrolls selected reference element into view
    useEffect(() => {
        const container = flockListRef.current;
        const target = targetItemRef.current;
        if (container && target) {
            console.log(`RefFlock (ctx: ${options?.context ? options?.context : 'nil'}): scrolling to targetItemRef`)
            target.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" })
            target.focus()
        }
    })  // no dependencies means runs upon EVERY render

    useEffect(() => {
        // Focus on the element when the component mounts to ensure keystrokes get focused
        if (options?.context) {
            // console.log(`RefFlock (${options?.context}): setting focus to flockListRef`)
            flockListRef.current.focus()
        }
    }, [options]);

    const handleKeyDown = (event) => {

        if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
            // left and up keys navigate to PREV ref in list
            event.stopPropagation()
            event.preventDefault()
            console.log(`RefFlock: handleKeyDown (context: ${options?.context}): selectedRefIndex: ${selectedRefIndex}, arrowLeft or arrowUp`)
            handleNavPrev()

        } else if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
            // right and down keys navigate to NEXT ref in list
            event.stopPropagation()
            event.preventDefault()
            console.log(`RefFlock: handleKeyDown (context: ${options?.context}): selectedRefIndex: ${selectedRefIndex}, arrowRight or arrowDown`)
            handleNavNext()
        }

    };

    const handleListClick= (e) => {
        console.log("handleListClick")
        e.preventDefault()  // prevents internal <a> links from jumping automatically

        const refElement = e.target.closest('button.ref-button')
        if (!refElement) return // if we didn't click on a ref button, bail

        // get the reference ID from the button's dataset["ref_index"] attribute
        const refIndex = e.target.closest('button.ref-button').dataset["ref_index"]

        // send action up the calling component tree
        onAction( {
            "action": "referenceClicked",
            "value": refIndex,
        })

    }


    // if no references to show...
    if (!refArray) {
        console.log("RefFlock: No references to show")
        return <FlockBox caption={"References List"} className={"ref-flock"}>
            {/*{"No references to show."}*/}
        </FlockBox>
    }

    const onHoverListItem = e => {
        // // show tool tip for link status icon
        // const eButton = e.target.closest('button')
        // const ref = eButton.attributes['ref-ref']
        //
        // console.log("hovering over list item")
        //
        // let html = ``
        //     // TODO: expand ref list hover detail
        //     // const linkStatus = e.target.dataset['linkStatus']
        //     // if (linkStatus) {
        //     //     html = `<div>${linkDefs[linkStatus]?.desc ? linkDefs[linkStatus]?.desc : "Unknown link status"}</div>`
        //     // }
        //
        // // TODO: set timer for hover to wait, and then hover remove
        // // html = "Click for Reference details"
        // setTooltipHtmlRefList(html)
    }

    const handleTapestryRefExport = () => {

        // copy Tapestry JSON definition to clipboard

                        // // Format current date/time as "YYYY.MM.DD HH:mm"
                        // const now = new Date();
                        // const year = now.getFullYear();
                        // const month = String(now.getMonth() + 1).padStart(2, '0');
                        // const day = String(now.getDate()).padStart(2, '0');
                        // const hours = String(now.getHours()).padStart(2, '0');
                        // const minutes = String(now.getMinutes()).padStart(2, '0');
                        // const dateTimeStr = `${year}.${month}.${day} ${hours}:${minutes}`;

        const titleWithDateTime = getTitleWithDateTime(pageData.page_title)

        const tapestryRefData = parseRefTapestry(
            pageData,
            options = {
                "title": titleWithDateTime,
                "backgroundColor": "#69a55d"
            }
        )
        const tapestryRefDataStr = JSON.stringify(tapestryRefData, null, 2)

        copyToClipboard(tapestryRefDataStr, `Tapestry reference data copied`,
            () => {
                iareAlert(`Tapestry data for references copied to the clipboard`, refFeedbackElement)
            })
    }

    const getTitleWithDateTime = (title) => {
        // Format current date/time as "YYYY.MM.DD HH:mm"
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const dateTimeStr = `${year}.${month}.${day} ${hours}:${minutes}`;
        return `${title} : ${dateTimeStr}`;
    }

    const handleTapestryZipExport = async () => {

        // send Tapestry JSON definition to IARI tapestry_zip endpoint,
        // and offer the returned zip file to the user for download

        const titleWithDateTime = getTitleWithDateTime(pageData.page_title)

        const tapestryRefData = parseRefTapestry(
            pageData,
            {
                "title": titleWithDateTime,
                "backgroundColor": "#69a55d"
            }
        )

        const endpoint = `${myConfig.iariSource}/tapestry_zip`

        try {
            const response = await fetch(endpoint, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(tapestryRefData),
            })

            if (!response.ok) {
                // IARI returns {"error": "..."} on failure
                const data = await response.json().catch(() => null)
                throw new Error(data?.error ?? `${response.status} ${response.statusText}`)
            }

            const zipBlob = await response.blob()

            // NB IARI's Content-Disposition header is not exposed to us via CORS,
            // so we make the file name here, the same way IARI does
            const fileStem = titleWithDateTime
                .replace(/[^A-Za-z0-9._-]+/g, "_")
                .replace(/^[._]+|[._]+$/g, "")
                || "tapestry"

            // offer zip to user by "clicking" a temporary download link
            const blobUrl = URL.createObjectURL(zipBlob)
            const link = document.createElement("a")
            link.href = blobUrl
            link.download = `${fileStem}.zip`
            document.body.appendChild(link)
            link.click()
            link.remove()
            URL.revokeObjectURL(blobUrl)

            iareAlert(`Tapestry zip file created`, refFeedbackElement)

        } catch (err) {
            console.error(`RefFlock::handleTapestryZipExport: ${err.message}`)
            iareAlert(`Tapestry zip export failed: ${err.message}`, refFeedbackElement)
        }
    }


    const handleCopyRefs = () => { // used to copy url list and status

        let refArrayData = filteredRefs

        // sort filtered refs by order they arrived from source
        // and return array of ref contents
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

        copyToClipboard(convertToCSV(refArrayData), `${numItems} References`,
            () => {
                // iareAlert("Arf!", urlFeedbackElement)
                iareAlert("Copied to clipboard", refFeedbackElement)
            })

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

    const filteredRefs = refFilter
        ? refArray.filter((refFilter.filterFunction)().bind(null, pageData.urlDict), ) // NB Note self-calling function
        : refArray;

    const filterDescription = options.show_filter_description
        ? <div className={"ref-list-filter-desc"} >
            <FilterConditionBox filter={refFilter} />
        </div>
        : null

    const flockListHeader = options.show_header
        ? <div className={"ref-list-header"}
               key={"key-ref-list-header"}>
            <div className={"list-header-row"}>
                <div className={"list-name"}>Reference</div>
            </div>
        </div>
        : null

    const filteredRows = filteredRefs.map((myRef, i) => {

        let referenceCaption = null

        if (pageData.iariParseMethod === ParseMethods.WIKIPARSE_V1.key ||
            pageData.iariParseMethod === ParseMethods.WIKIPARSE_XREF.key) {
            // eslint-disable-next-line react/jsx-pascal-case
            referenceCaption = <CitationDisplayV1 reference={myRef} index={i} />

        } else if (pageData.iariParseMethod === ParseMethods.WIKIPARSE_V2.key) {
            // eslint-disable-next-line react/jsx-pascal-case
            referenceCaption = <CitationDisplayV2 options={options} reference={myRef} index={i} />
        }

        const isSelected = (
            selectedRefIndex !== undefined
            && selectedRefIndex !== null
            && (selectedRefIndex.toString() === myRef.ref_index.toString())
        )

        if (isSelected) selectedArrayIndex = i

        let className=`ref-button${isSelected ? ' selected' : ''}`

        return isSelected
            // we set the "ref" value to targetItemRef
            // - this allows us to scroll "target ref button" into view
            ? <button ref={targetItemRef}
                      key={myRef.ref_index}
                      className={className}
                      ref-ref={myRef}
                      data-ref_index={myRef.ref_index}
                      data-array-index={i}
            >{referenceCaption}</button>

            : <button key={myRef.ref_index}
                      className={className}
                      data-ref_index={myRef.ref_index}
                      ref-ref={myRef}
                      data-array-index={i}
            >{referenceCaption}</button>
    })  // end filteredRows

    const showPrev = true
    const showNext = true

    const refNavigation = options.show_ref_nav
        ? <div className={"ref-list-navigation"} >
            <span onClick={handleNavPrev} className={`ref-nav-icon-prev ${showPrev ? "" : "disabled" }`}>Prev</span>
            <span className={"ref-nav-info"}>Reference {selectedArrayIndex + 1} of {filteredRefs.length}</span>
            <span onClick={handleNavNext} className={`ref-nav-icon-next ${showNext ? "" : "disabled" }`}>Next</span>
        </div>
        : null


    const buttonTapestryRefExport =
        <button onClick={handleTapestryRefExport}
                className={'btn utility-button small-button'}
        >
            <img src={tapestryIcon} alt="Tapestry Icon" style={{marginRight: '.5rem', height: '1rem', width: '1rem'}}/>
            {/*<span>Tapestry</span>*/}
        </button>

    const buttonTapestryZipExport =
        <button onClick={handleTapestryZipExport}
                className={'btn utility-button small-button'}
        >
            <img src={tapestryIcon} alt="Tapestry Icon" style={{marginRight: '.5rem', height: '1rem', width: '1rem'}}/>
            <span>Zip</span>
        </button>

    const buttonCopyRefs =
        <div onClick={handleCopyRefs}
             className={"document-copy-button"}
             style={{
                 height: "1.0rem", width: "1.0rem",
                 marginLeft: ".25rem",
                 marginTop: ".25rem",
                 // height: "1.5rem", width: "1.5rem",
                         // cursor: "pointer",
                         // display: "inline-block"
             }}>
            <svg aria-label="Copy References to Clipboard"
                 viewBox={"0 0 512 512"}
                // className={"document-copy-button-svg"}
            >
                <use href={`${copyDocumentsIcon}#document-copy`}/>
            </svg>
        </div>

    const captionText = options?.caption ?? "References List"

    const flockInfo = <div>{filteredRefs.length} {filteredRefs.length === 1 ? 'Reference' : 'References'}</div>

    const flockCaption = <>

        <div className={"main-caption ref-list-caption"}>
            {captionText}
            <div style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "flex-end",
                gap: ".25rem",
            }}>
                <div id={refFeedbackElement} className={"iare-feedback"}/>
                <div className={"flock-caption-buttons"}>
                    {/*{options?.show_tapestry ? buttonTapestryRefExport : null}*/}
                    {options?.show_tapestry ? buttonTapestryZipExport : null}
                    {buttonCopyRefs}
                </div>
            </div>
        </div>

        {refNavigation}

        <div className={"sub-caption"}>
            <div>{flockInfo}</div>
        </div>
    </>


    const flockList = <>
        {flockListHeader}
        <div className={"ref-list"}
             key={"key-ref-list"}

             ref={flockListRef}

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

    return <FlockBox onKeyDown={options?.show_ref_nav ? handleKeyDown : null}  // handle keydown only if show navigation
                     caption={flockCaption}
                     className={`ref-flock ${className ? ` ${className}` : ''}`}>

        {flockList}

    </FlockBox>

}

export default RefFlock;

