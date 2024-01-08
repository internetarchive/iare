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

    return <div className={"url-overview"}>

        {/*<div className={"row"}>*/}
        {/*    <div className={"col"}>*/}
        {/*        <div className={"control-box"}>Controls here.</div>*/}
        {/*    </div>*/}

        {/*</div>*/}

        <ControlBox >Controls here.</ControlBox>

        <div className={"row"}>

            <div className={"col col-12"}>

                        {/* the old URL status pie chart */}
                        {/*<FilterBox caption="URL Status Codes" showContents={true}>*/}
                        {/*    <UrlStatusChart pageData={pageData} colors={colors} onAction={onAction} />*/}
                        {/*</FilterBox>*/}

                <FilterBox caption={"Actionable"} showContents={true} >
                    <ActionableChart pageData={pageData} onAction={onAction} currentState={currentState?.actionables} />
                </FilterBox>

                <FilterBox caption="Link Status Codes" showContents={true}>
                    <LinkStatusChart pageData={pageData} onAction={onAction} />
                </FilterBox>

                <FilterBox caption="Papers and DOIs" showContents={true}>
                    <PapersChart pageData={pageData} onAction={onAction} />
                </FilterBox>

                <FilterBox caption="Reliability Statistics">
                    <PerennialChart pageData={pageData} onAction={onAction} />
                </FilterBox>

                <FilterBox caption="Top Level Domains">
                    <TldChart pageData={pageData} onAction={onAction} />
                </FilterBox>

                <FilterBox caption="Links to Books">
                    <BooksChart pageData={pageData} options={{colors:iareColors}} onAction={onAction} />
                </FilterBox>

                <FilterBox caption="Template Occurrences">
                    <TemplateChart pageData={pageData} onAction={onAction} />
                </FilterBox>

            </div>

        </div>

    </div>

})

export default UrlOverview;