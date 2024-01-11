import React, {useState} from 'react'
// import {ConfigContext} from "../../contexts/ConfigContext";
// import UrlStatusChart from "./charts/UrlStatusChart";
import TemplateChart from "./charts/TemplateChart";
import PerennialChart from "./charts/PerennialChart";
import TldChart from "./charts/TldChart";
import {
    Chart,
    LinearScale,
    BarElement,
    ArcElement,
    Legend,
    Tooltip,
    Title,
    SubTitle,
    Colors,
} from 'chart.js'
import BooksChart from "./charts/BooksChart";
import FilterBox from "../FilterBox";
import PapersChart from "./charts/PapersChart";
import LinkStatusChart from "./charts/LinkStatusChart";
import ControlBox from "../ControlBox";
import ActionableChart from "./charts/ActionableChart";

Chart.register(
    LinearScale,
    BarElement,
    ArcElement,
    Legend,
    Tooltip,
    Title,
    SubTitle,
    Colors,
);

const UrlOverview = React.memo(({pageData, options, onAction, currentState}) => {  // React.memo so doesn't re-rerender with param changes

    const [expand, setExpand] = useState({
        "actionable" : true,
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

    const onToggleShow = (name) => {
        console.log("hi there")
        setExpand( prevState => {
            return {
                ...prevState,
                [name]:!prevState[name]
            }
        })
    }

    return <div className={"url-overview"}>

        <ControlBox>
            <h3 className={"control-box-caption"}>Filters</h3>
            <div className={"category-row"}>Click on an Item to filter URLs and References.</div>
            <div className={"button-row"}>
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
            </div>
        </ControlBox>

        <div className={"row"}>

            <div className={"col col-12"}>

                        {/* the old URL status pie chart */}
                        {/*<FilterBox caption="URL Status Codes" showContents={true}>*/}
                        {/*    <UrlStatusChart pageData={pageData} colors={colors} onAction={onAction} currentState={currentState?. } />*/}
                        {/*</FilterBox>*/}


                <FilterBox name={"actionable"} caption={"Actionable"} showContents={expand.actionable} onToggle={onToggleShow} >
                    <ActionableChart pageData={pageData} onAction={onAction} currentState={currentState?.actionable} />
                </FilterBox>

                <FilterBox name={"link_status"} caption="Link Status Codes" showContents={expand.link_status} onToggle={onToggleShow}>
                    <LinkStatusChart pageData={pageData} onAction={onAction} currentState={currentState?.link_status } />
                </FilterBox>

                <FilterBox name={"papers"} caption="Papers and DOIs" showContents={expand.papers} onToggle={onToggleShow}>
                    <PapersChart pageData={pageData} onAction={onAction} currentState={currentState?.papers } />
                </FilterBox>

                <FilterBox name={"reliability"} caption="Reliability Statistics" showContents={expand.reliability} onToggle={onToggleShow}>
                    <PerennialChart pageData={pageData} onAction={onAction} currentState={currentState?.perennial } />
                </FilterBox>

                <FilterBox name={"tld"} caption="Top Level Domains" showContents={expand.tld} onToggle={onToggleShow}>
                    <TldChart pageData={pageData} onAction={onAction} currentState={currentState?.tld } />
                </FilterBox>

                <FilterBox name={"books"} caption="Links to Books" showContents={expand.books} onToggle={onToggleShow}>
                    <BooksChart pageData={pageData} options={{colors:iareColors}} onAction={onAction} currentState={currentState?.books } />
                </FilterBox>

                <FilterBox name={"templates"} caption="Template Occurrences" showContents={expand.templates} onToggle={onToggleShow}>
                    <TemplateChart pageData={pageData} onAction={onAction} currentState={currentState?.templates } />
                </FilterBox>

            </div>

        </div>

    </div>

})

export default UrlOverview;