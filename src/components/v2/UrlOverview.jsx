import React, {useState} from 'react'
import TemplateChart from "./charts/TemplateChart.jsx";
import PerennialChart from "./charts/PerennialChart.jsx";
import TldChart from "./charts/TldChart.jsx";
import BooksChart from "./charts/BooksChart.jsx";
import FilterBox from "../FilterBox.jsx";
import PapersChart from "./charts/PapersChart.jsx";
import LinkStatusChart from "./charts/LinkStatusChart.jsx";
import ControlBox from "../ControlBox.jsx";
import ActionableChart from "./charts/ActionableChart.jsx";
import PayLevelDomainsChart from "./charts/PayLevelDomainsChart.jsx";
import Checkbox from "../Checkbox.jsx";

import {Chart, LinearScale, BarElement, ArcElement, Legend, Tooltip, Title, SubTitle, Colors,} from 'chart.js'
import ReferenceStats from "./charts/ReferenceStats.jsx";
import {ConfigContext} from "../../contexts/ConfigContext.jsx";

import {noBookLink, bookDefs} from "../../utils/iariUtils.js";

Chart.register(LinearScale, BarElement, ArcElement, Legend, Tooltip, Title, SubTitle, Colors,);

// displays overview stats of article data
const UrlOverview = React.memo(({
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

    const [expand, setExpand] = useState({
        "actionable" : true,
        "reference_stats" : true,
        "domains" : true,
        "link_status" : true,
        "papers" : true,
        "reliability" : true,
        "tld" : true,
        "books" : true,
        "templates" : true,
    })
    const iareColors = {
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
    }

    let myConfig = React.useContext(ConfigContext);
    myConfig = myConfig ? myConfig : {} // prevents "undefined.<param>" errors

    const onToggleShow = (name) => {
        setExpand( prevState => {
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
                setExpand(prevState => {
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
                setExpand(prevState => {
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
        <FilterBox name={"reference_stats"} caption={"Reference Stats"} showContents={expand.reference_stats}
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
                       showContents={expand.actionable}
                       onToggle={onToggleShow}>
                <ActionableChart pageData={pageData} onAction={onAction}
                                 currentState={currentState?.actionable}
                                 tooltipId={tooltipId}/>
            </FilterBox>

            <FilterBox name={"link_status"} caption="Link Status Codes"
                       showContents={expand.link_status}
                       onToggle={onToggleShow}>
                <LinkStatusChart pageData={pageData} onAction={onAction}
                                 currentState={currentState?.link_status}/>
            </FilterBox>


            <FilterBox name={"books"} caption="Links to Books"
                       showContents={expand.books}
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
                       showContents={expand.papers}
                       onToggle={onToggleShow}>
                <PapersChart pageData={pageData} onAction={onAction}
                             currentState={currentState?.papers}/>
            </FilterBox>


            <FilterBox name={"domains"} caption="Pay Level Domains" className={'domains-filter-box'}
                       showContents={expand.domains}
                       onToggle={onToggleShow}>
                <PayLevelDomainsChart pageData={pageData} onAction={onAction}
                                      currentState={currentState?.domains}/>
            </FilterBox>

            <FilterBox name={"reliability"} caption="Reliability Statistics" showContents={expand.reliability}
                       onToggle={onToggleShow}>
                <PerennialChart pageData={pageData} onAction={onAction}
                                currentState={currentState?.perennial}/>
            </FilterBox>

            <FilterBox name={"tld"} caption="Top Level Domains" showContents={expand.tld} onToggle={onToggleShow}>
                <TldChart pageData={pageData} onAction={onAction}
                          currentState={currentState?.tld}/>
            </FilterBox>

            <FilterBox name={"templates"} caption="Template Occurrences" showContents={expand.templates}
                       onToggle={onToggleShow}>
                <TemplateChart pageData={pageData} onAction={onAction}
                               currentState={currentState?.templates}/>
            </FilterBox>

        </div>

    </div>

})

export default UrlOverview;