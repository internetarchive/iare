import React, {useState} from "react";
import FilterButton from "../FilterButton";
import PieChart from "../PieChart.js";
// import BarChart from "../BarChart.js";

import { URL_FILTER_MAP } from './filters/urlFilterMaps.js';
import { REF_FILTER_MAP, REF_FILTER_NAMES, REF_TYPES_FILTER_MAP } from './filters/refFilterMaps.js';

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
import FilterButtons from "../FilterButtons";
// import {getRelativePosition} from "chart.js/dist/helpers/helpers.dom";

Chart.register(
    LinearScale,
    BarElement,
    ArcElement,
    Legend,
    Tooltip,
    Title,
    SubTitle,
    Colors);

        // the following two lines will register all chart.js things
        // import { Chart, registerables } from 'chart.js';
        // Chart.register(...registerables);


const colors = {
    blue   : "#35a2eb",
    red    : "#ff6384",
    teal   : "#4bc0c0",
    orange : "#ff9f40",
    purple : "#9866ff",
    yellow : "#ffcd57",
    grey   : "#c9cbcf",
    magenta: "#f763ff",
}


// display filter buttons
const ReferenceFilters = ( {filterList, filterCaption}) => {
    return <div>
        {/*<h4>Reference Filters<br/><span style={{fontSize:"smaller", fontWeight:"normal"}}>Current filter: {filterCaption}</span></h4>*/}
        <h4>Reference Filters</h4>
        <div className={"reference-filters"}>
            {filterList}
        </div>
    </div>

}

// show ref overview interactions
const RefOverview = ( { references, onClick, curFilterName },  ) => {

    return <div className={"reference-type-filters"}>
        <FilterButtons
            flock ={references}
            filterMap = {REF_TYPES_FILTER_MAP}
            filterList = {[]} // use all
            onClick={onClick}
            caption = "Reference Types"
            className = ""
            currentFilterName={curFilterName} />
    </div>
}

/*
    UrlOverview:
    assumed structure of overview object:

    { urlCounts : [
            {
            label:,
            count:,
            link:
            }
        ,...
        ]
    }
*/
const UrlOverview = ( { overview, onClickChart } ) => {

    if (!overview) { return <div>
            <h4>Urls</h4>
            <p>No Url statistics to show.</p>
        </div>}

    // remove "all" entry for pie chart
    const overviewWithoutAll = overview.urlCounts
        ? overview.urlCounts.filter(s => s.link !== "all")
        : [];

    const onClickLegend = (event, legendItem, legend) => {
        const index = legendItem.index;
        const ci = legend.chart;
        const link = ci.data.datasets[0].links[index];
        // console.log(`legend index: ${index}, link: ${link}`);

        // pass link up to passed in click routine
        onClickChart(link)
    }

    const chartData = {

        labels: overviewWithoutAll.map( d => d.label),
        datasets: [{
            label: "URLs",
            data: overviewWithoutAll.map( d => d.count),
            links: overviewWithoutAll.map( d => d.link),
            backgroundColor: [ colors.teal, colors.yellow, colors.red, colors.magenta, colors.grey, ]
        }],

        borderColor: "black",
        borderWidth: 2,
    }

    const options = {
        cutout: "50%",
        responsive: true,
        plugins: {
            legend: {
                display: true,
                position: 'top',
                align: 'start',
                // title: {
                //     text: "Legend",
                //     display: true,
                // },
                labels : {
                    boxWidth : 30,
                    boxHeight : 16,
                    font: {
                        size: 14
                    },
                },
                onClick : onClickLegend,
            },
            // subtitle: {
            //     display: true,
            //     text: 'Custom Chart Subtitle'
            // },
            // title: {
            //     display: true,
            //     text: 'URL Return Status Code Breakdown'
            // },
            animation: {
                animateScale: true,
                    animateRotate: true
            },
        },
    }

    // // debug display for chartData
    // return <div>
    //     <h4>Urls</h4>
    //     <RawJson obj={chartData} />
    // </div>

    const onClick = (link) => {
        // console.log("pie chart clicked, link=", link)
        onClickChart(link);
    }

    const total = overview.urlCounts && overview.urlCounts
        ? overview.urlCounts.filter(s => s.link === "all")[0].count
        : ""

    return <div>
        <h4>URLs - {total} total</h4>
        <div className={"url-chart-display"}>
            {/*<pre className={"raw-json"}>{JSON.stringify(overview, null, 2)}</pre>*/}
            {chartData.datasets[0].data.length > 0 ?
            <PieChart chartData={chartData} options={options} onClick={onClick} />
            : <p>No Pie</p>}
        </div>
    </div>

}

export default function PageOverview( { references,
                                          refOverview,
                                          urlOverview,
                                          setRefFilter,
                                          setUrlFilter,
                                        })
{
    const [refFilterName, setRefFilterName] = useState( null );
    const [refTypeFilterName, setRefTypeFilterName] = useState( '' );
    const [urlFilterName, setUrlFilterName] = useState( null );

    function handleRefButton(name) {
        setRefFilterName(name);
        setRefTypeFilterName("");
        const f = REF_FILTER_MAP[name];
        setRefFilter(f ? f.filterFunction : null)
    }

    function handleRefTypeButton(name) {
        setRefTypeFilterName(name);
        setRefFilterName("");
        const f = REF_TYPES_FILTER_MAP[name];
        setRefFilter(f ? f.filterFunction : null)
    }


    const refFilterList = REF_FILTER_NAMES.map((name) => {
        let f = REF_FILTER_MAP[name]; // TODO: catch null f error?
        f.count = references ? references.filter((f.filterFunction)()).length : 0; // Note the self-evaluating filterFunction!
        return <FilterButton key={name}
                             name={name}
                             caption={f.caption}
                             desc={f.desc}
                             count={f.count}
                             isPressed={name===refFilterName}
                             onClick = {handleRefButton}
                             useDesc = {false}
        />
    });

    const handleUrlButton= (name) => {
        // if new name === current name, toggle between "all" and new name
        const newName = urlFilterName === name ? "all" : name;
        setUrlFilterName(newName); // calls "UP" to the enclosing component
        const f = URL_FILTER_MAP[newName];
        setUrlFilter(f)
    }

    // console.log("urlOverview:", urlOverview);

    return <div className={"page-overview"}>
        <h3>Page Overview</h3>
        <div className={"page-overview-wrap"}>

            <UrlOverview overview={urlOverview} onClickChart={handleUrlButton}/>
            {/*<Urls urlArray={urlBigArray} filter={myUrlFilter}/>*/}

            {/*<UrlFilters filterList={urlFilterList} filterCaption={URL_FILTER_MAP[urlFilterName] ? URL_FILTER_MAP[urlFilterName].caption : ""} />*/}

            <RefOverview references={references} onClick={handleRefTypeButton} curFilterName={refTypeFilterName} />

            <ReferenceFilters filterList={refFilterList}
                              filterCaption={REF_FILTER_MAP[refFilterName] ? REF_FILTER_MAP[refFilterName].caption : ""} />

        </div>
    </div>
}