import React from 'react';
// import FilterButtons from "../FilterButtons";
// import FilterButton from "../FilterButton";
// import { Tooltip } from 'react-tooltip'
import RawJson from "../RawJson";
import BarChart from "../BarChart";

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
    CategoryScale,
} from 'chart.js'

// import ChartDataLabels from 'chartjs-plugin-datalabels';
// Chart.register(ChartDataLabels,)

Chart.register(
    LinearScale,
    BarElement,
    ArcElement,
    Legend,
    Tooltip,
    Title,
    SubTitle,
    Colors,
    CategoryScale,

);

const colors = { // TODO: put this in useContext?
    blue   : "#35a2eb",
    red    : "#ff6384",
    teal   : "#4bc0c0",
    orange : "#ff9f40",
    purple : "#9866ff",
    yellow : "#ffcd57",
    grey   : "#c9cbcf",
    magenta: "#f763ff",
}
const barColors = ["blue","teal","yellow","orange","red","magenta","purple",]


// summary is assumed to have a filterSets property, an array of filterDef sets:
//    filterSets : [ <filterSet1>, <filterSet2>, etc...]
export default function RefOverview ({ refArray, summary, onAction, curFilterName } ) {

    // const handleFilterClick = (link, context) => {
    //     // console.log (`RefOverview::handleClick: link: ${link}, context: ${context}`);
    //     onAction({
    //         action:"setFilter",
    //         value: link,
    //         context: context
    //         })
    //     }

    const handleChartClick = (link, context) => {
        // console.log (`RefOverview::handleClick: link: ${link}, context: ${context}`);
        alert(`Chart clicked, link=${link}`);
        // onAction({
        //     action:"setFilter",
        //     value: link,
        //     context: context
        // })
    }

    // const tooltip = <Tooltip id="my-filter-tooltip"
    //     float={true}
    //     closeOnEsc={true}
    //     delayShow={420}
    //     // delayHide={200}
    //     variant={"info"}
    //     noArrow={true}
    //     offset={5}
    // />

    let overviewDisplay;

    if (!summary) {
        overviewDisplay = <p>No reference summary information to show.</p>
    } else {

                // overviewDisplay = <div class={"ref-filters"}>
                //     {/*<RawJson obj={summary} />*/}
                //
                //     <FilterButtons
                //         flock = {refArray}
                //         filterMap = {summary.filterSets[0]}
                //         filterList ={[]}
                //         onClick ={ (e) => {
                //             handleFilterClick(e, "set-0")
                //         }}
                //         caption = "Reference Types"
                //         className = "ref-filters-0"
                //         currentFilterName = {curFilterName} />
                //
                //     <FilterButtons
                //         flock = {refArray}
                //         filterMap = {summary.filterSets[1]}
                //         filterList ={[]}
                //         onClick ={ (e) => {
                //             handleFilterClick(e, "set-1")
                //         }}
                //         caption = "Reference Filters"
                //         className = "ref-filters-1"
                //         currentFilterName = {curFilterName} />
                //
                // </div>


        // turn summary.filterSets into barChartData

        let filterData = [];

        if (!refArray) {

            // cant do any data cause refArray empty-ish

        } else {

            let colorIndex = barColors.length;

            summary.filterSets.map( (filterSet) => {
                const names = Object.keys(filterSet);
                filterData = filterData.concat(
                    names.map((name) => {
                        let f = filterSet[name];
                        f.count = refArray.filter((f.filterFunction)()).length;

                        colorIndex = colorIndex >= (barColors.length -1)
                            ? 0 // if was on largest value, reset to 0
                            : colorIndex+1; // round-robin from colors
console.log(`chart data: barColor[${colorIndex}]=${barColors[colorIndex]}`)
                        return {
                            name: name,
                            caption: f.caption,
                            count: f.count,
                            desc: f.desc,
                            color: colors[barColors[colorIndex]]
                        }}))})
        }


        const chartData = {

            labels: filterData.map( d => d.caption),
            datasets: [{
                label: "Reference Counts",
                data: filterData.map( d => d.count),
                links: filterData.map( d => d.name),
                // backgroundColor: [ colors.teal, colors.yellow, colors.red, colors.magenta, colors.grey, ]
                backgroundColor: filterData.map( d => d.color)
            }],

            borderColor: "black",
            borderWidth: 2,
        }

        const labelCallback = (value, index, ticks) => {
            // return '$' + value;
            return filterData[index].caption;
        }

        const chartOptions = {
            indexAxis: "y",
            // elements: {
            //     bar: {
            //         borderWidth: 2,
            //     },
            // },
            responsive: true,

            scales: {
                y: {
                    ticks: {

                        // Include a dollar sign in the ticks
                        callback: labelCallback,

                        // // Include a dollar sign in the ticks
                        // callback: function(value, index, ticks) {
                        //     console.log(ticks)
                        //     return '$' + value;
                        // }
                        color: "dimgrey",
                        font: {
                            family: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
                            size: 15,
                            // style: "italic",
                            weight: 400,
                            lineHeight: 1.2,
                        }

                    },
                }

            },

            plugins: {
                legend: false,

                // title: {
                //     display: true,
                //     text: 'Chart.js Horizontal Bar Chart',
                // },

                // remember we cam also do:
                // Chart.defaults.font.size = 16;

                // datalabels: false
                datalabels: {
                    // color: '#36A2EB',
                    anchor:"end",
                    align:"right",
                    color: "dimgrey",
                    font: {
                        family: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
                        size: 15,
                        // style: "italic",
                        weight: 400,
                        lineHeight: 1.2,
                    }
                }

            },
            // hoverBackgroundColor: "red",
            // barThickness: "flex"
            offset: true,

            layout: {
                padding: 0
            },


            // dataLabels: {
            //     anchor: 'end',
            //     align: 'end',
            //     backgroundColor: null,
            //     borderColor: null,
            //     borderRadius: 4,
            //     borderWidth: 1,
            //     color: '#223388',
            //     font: function(context) {
            //         let width = context.chart.width;
            //         let size = Math.round(width / 32);
            //         return {
            //             size: size,
            //             weight: 600
            //         };
            //     },
            //     offset: 4,
            //     padding: 0,
            //     formatter: function(value) {
            //         return Math.round(value * 10) / 10
            //     }
            // }
        };

        overviewDisplay = <div className={"ref-filter-chart"}>
            {/*<h4>chartData</h4>*/}
            {/*{tooltip}*/}
            {/*<RawJson obj={chartData} />*/}
            <BarChart chartData={chartData} options={chartOptions} onClick={handleChartClick} />
        </div>

        // eventually this will be a bar chart, i imagine..., in which case we'll pull
        // summary info from some other field of the summary info

    }

    // function handleRefButton(name) {
    //     setRefFilterName(name);
    //     setRefTypeFilterName("");
    //     const f = REF_FILTER_DEFS[name];
    //     setRefFilter(f ? f.filterFunction : null)
    // }
    //
    // function handleRefTypeButton(name) {
    //     setRefTypeFilterName(name);
    //     setRefFilterName("");
    //     const f = REF_FILTER_TYPES[name];
    //     setRefFilter(f ? f.filterFunction : null)
    // }
    //
    //
    // const myClickFilter = (link) => {
    //     // console.log("pie chart clicked, link=", link)
    //     onAction( {action:"setFilter", value:link})
    // }

    return <div className={"ref-overview"}>
        <div className={"ref-overview-wrap"}>
            {overviewDisplay}
        </div>
    </div>

}