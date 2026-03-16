import React, {useState} from 'react'

import TldChart from "../../../../charts/TldChart.jsx";
import BooksChart from "../../../../charts/BooksChart.jsx";
import PapersChart from "../../../../charts/PapersChart.jsx";
import ActionableChart from "../../../../charts/ActionableChart.jsx";
import PayLevelDomainsChart from "../../../../charts/PayLevelDomainsChart.jsx";
import ReferenceStats from "../../../../charts/ReferenceStats.jsx";
import FilterBox from "../../../../FilterBox.jsx";
import ControlBox from "../../../../ControlBox.jsx";
import Checkbox from "../../../../Checkbox.jsx";

import {Chart, LinearScale, BarElement, ArcElement, Legend, Tooltip, Title, SubTitle, Colors,} from 'chart.js'

import {ConfigContext} from "../../../../../contexts/ConfigContext.jsx";
import {noBookLink, bookDefs} from "../../../../../utils/iariUtils.js";
import {iareColors} from "../../../../../constants/iareColors.jsx";
import SignalsChart from "../../../../charts/SignalsChart.jsx";
import ArchiveStatusChart from "../../../../charts/ArchiveStatusChart.jsx";
import LiveStatusChart from "../../../../charts/LiveStatusChart.jsx";

Chart.register(LinearScale, BarElement, ArcElement, Legend, Tooltip, Title, SubTitle, Colors,);

// displays overview stats of article data
const GrokFilterPanel = React.memo(({
// React.memo so doesn't re-rerender with param changes
                                       pageData,
                                       options,
                                       onAction,
                                       currentState,
                                       tooltipId=null
                                   }) => {

    const [autoExpand, setAutoExpand] = useState(true )

    // todo create a structure called "filters" or "myFilters", defining a key
    // for each filter we want to have here.

    const [expanded, setExpanded] = useState({
        "actionable" : true,
        "archive" : true,
        "live_status" : true,
        "domains" : true,
        "signals" : true,
        "tld" : true,
        "books" : true,
        "papers" : true,
    })

    let myConfig = React.useContext(ConfigContext);
    myConfig = myConfig ? myConfig : {} // prevents "undefined.<param>" errors

    const onToggleShow = (name) => {
        setExpanded( prevState => {
            const newState = {}
            // init newState with all false if autoExpand
            Object.keys(prevState).forEach( state => {
                newState[state] = autoExpand ? false : prevState[state]
            })
            // regardless set state specified by name to true
            newState[name] = 0 && autoExpand ? true : !prevState[name]
            return newState
        })
    }

    const accordionCheckbox = <Checkbox className={"auto-expand"} label={"Accordion Mode"} value={autoExpand}
                                        onChange={() => setAutoExpand(prevState => !prevState)}
                                        tooltipId={tooltipId}
                                        tooltipContent={"In Accordion Mode, one filter is visible at a time.<br/>Clicking a filter will hide all others."}
    />

    const filterButtonRow = <div className={"button-row"}>
        <button
            type="button"
            className={`btn small-button utility-button`}
            onClick={() => {
                setExpanded(prevState => {
                    const newState = {}
                    Object.keys(prevState).forEach(key => {
                        newState[key] = true
                    })
                    return newState
                })
            }}
            // // tooltip attributes
            // data-tooltip-id={props.tooltipId}
            // data-tooltip-html={props.tooltip}
        >Expand All
        </button>
        <button
            type="button"
            className={`btn small-button utility-button`}
            onClick={() => {
                setExpanded(prevState => {
                    const newState = {}
                    Object.keys(prevState).forEach(key => {
                        newState[key] = false
                    })
                    return newState
                })
            }}
            // // tooltip attributes
            // data-tooltip-id={props.tooltipId}
            // data-tooltip-html={props.tooltip}
        >Shrink All
        </button>
        {accordionCheckbox}
    </div>

    const debugFilters = myConfig.isShowDebugComponents && <>
        <FilterBox name={"reference_stats"} caption={"Reference Stats"} showContents={expanded.reference_stats}
                   onToggle={onToggleShow}  // gets passed filter name when clicked from within FilterBox
        >
            <ReferenceStats
                pageData={pageData}
                options={{
                    colors: {
                        blue: "#35a2eb",
                        darkBlue: "#1169a5",
                        red: "#ff6384",
                        teal: "#4bc0c0",
                        orange: "#ff9f40",
                        purple: "#9866ff",
                        yellow: "#ffcd57",
                        green: "#5bbd38",
                        grey: "#c9cbcf",
                        magenta: "#f763ff",
                        black: "#000000",
                        white: "#FFFFFF"
                    },
                    another_option:"your option here...",
                }}
                onAction={onAction}

                currentState={currentState?.reference_stats}
                tooltipId={tooltipId}/>

        </FilterBox>
    </>


    return <div className={"url-overview iare-ux-container"}>

        <div className={"iare-ux-header"}>
            <ControlBox>
                <h3 className={"control-box-caption"}>Filters <span className={"sub-caption"}>Use filters to set Conditions</span></h3>
                {filterButtonRow}
            </ControlBox>
        </div>

        <div className={"iare-ux-body"}>

            {/* the old URL status pie chart */}
            {/*<FilterBox caption="URL Status Codes" showContents={true}>*/}
            {/*    <UrlStatusChart pageData={pageData} colors={colors} onAction={onAction} currentState={currentState?. } />*/}
            {/*</FilterBox>*/}

            {debugFilters}  {/* eventually all filters will be in one variable with config-controlled inclusion */}

            <FilterBox name={"actionable"} caption={"Actionable"} className={'actionable-filter-box'}
                       showContents={expanded.actionable}
                       onToggle={onToggleShow}>
                <ActionableChart pageData={pageData} onAction={onAction}
                                 currentState={currentState?.actionable}
                                 tooltipId={tooltipId}/>
            </FilterBox>


            <FilterBox name={"archive"} caption="Archive Status"
                       showContents={expanded.archive}
                       onToggle={onToggleShow}>
                <ArchiveStatusChart pageData={pageData}
                                    options={{
                                        colors: iareColors,
                                    }}
                                    onAction={onAction}
                                    currentState={currentState?.archive}/>
            </FilterBox>


            <FilterBox name={"live_status"} caption="Live Status"
                       showContents={expanded.live_status}
                       onToggle={onToggleShow}>
                <LiveStatusChart pageData={pageData}
                                 options={{
                                     colors: iareColors,
                                 }}
                                 onAction={onAction}
                                 currentState={currentState?.live_status}/>
            </FilterBox>


            <FilterBox name={"books"} caption="Links to Books"
                       showContents={expanded.books}
                       onToggle={onToggleShow}>
                <BooksChart pageData={pageData}
                            options={{
                                colors: iareColors,
                                no_book_link_caption: bookDefs[noBookLink]?.caption,
                                no_book_link_key: noBookLink,
                            }}
                            onAction={onAction}
                            currentState={currentState?.books}/>
            </FilterBox>


            <FilterBox name={"papers"} caption="Links to Papers and DOIs"
                       showContents={expanded.papers}
                       onToggle={onToggleShow}>
                <PapersChart pageData={pageData} onAction={onAction}
                             currentState={currentState?.papers}/>
            </FilterBox>


            <FilterBox name={"domains"} caption="Pay Level Domains" className={'domains-filter-box'}
                       showContents={expanded.domains}
                       onToggle={onToggleShow}>
                <PayLevelDomainsChart pageData={pageData} onAction={onAction}
                                      currentState={currentState?.domains}/>
            </FilterBox>


            <FilterBox name={"signalValues"} caption="Wiki Signals" showContents={expanded.signals}
                       onToggle={onToggleShow}>
                <SignalsChart pageData={pageData} onAction={onAction}
                                currentState={currentState?.signalValues}/>
            </FilterBox>


            <FilterBox name={"tld"} caption="Top Level Domains" showContents={expanded.tld} onToggle={onToggleShow}>
                <TldChart pageData={pageData} onAction={onAction}
                          currentState={currentState?.tld}/>
            </FilterBox>

        </div>

    </div>

})

export default GrokFilterPanel;