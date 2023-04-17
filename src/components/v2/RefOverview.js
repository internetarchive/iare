import React, {useState} from 'react';
import { Tooltip as MyTooltip } from 'react-tooltip'
import BarChart from "../BarChart";
// import FilterButtons from "../FilterButtons";
// import FilterButton from "../FilterButton";

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


// summary is assumed to have a filterSets property, which is an array of {set,filterMap} objects:
//
// summary : {
//  filterSets: [
//     { context : "set-0", filterMap : REF_FILTER_TYPES },
//     { context : "set-1", filterMap : REF_FILTER_DEFS},
//  ]
// }
export default function RefOverview ({ refArray, summary, onAction, selectedFilter } ) {

    const [tooltipText, setTooltipText] = useState( '' );

    const handleAction = (link, context='') => {
        onAction( { action : "setFilter", value : link, context : context } )
    }

    const handleHover = (tooltipText='') => {
        setTooltipText(tooltipText);
    }

    let overviewDisplay;

    if (!summary) {
        overviewDisplay = <p>No reference summary information to show.</p>
    } else {

                // this is for FilterButtons instead of Bar graph.
                // might want to do both, and give a choice
                //
                // TODO: pass in tooltip-id in props for FilterButtons
                //
                // overviewDisplay = <div class={"ref-filters"}>
                //     {/*<RawJson obj={summary} />*/}
                //
                //     <FilterButtons
                //         flock = {refArray}
                //         filterMap = {summary.filterSets[0]}
                //         filterList ={[]}
                //         onClick ={ (e) => {
                //             handleAction(e, "set-0")
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
                //             handleAction(e, "set-1")
                //         }}
                //         caption = "Reference Filters"
                //         className = "ref-filters-1"
                //         currentFilterName = {curFilterName} />
                //
                // </div>


        let filterList = []; // accumulate filters into one list from summary

        if (!refArray) {

            // cant do any data cause refArray is empty

        } else {
            let colorIndex = barColors.length; // set up for color-loop

            summary.filterSets.forEach( (filterSet) => {
                const names = Object.keys(filterSet.filterMap);

                filterList = filterList.concat(

                    names.map((name) => {
                        let f = filterSet.filterMap[name];
                        f.count = refArray.filter((f.filterFunction)()).length;

                        colorIndex = colorIndex >= (barColors.length -1)
                            ? 0 // if was on largest value, reset to 0
                            : colorIndex+1; // round-robin from colors

                        return {
                            name: name,
                            context: filterSet.context,
                            caption: f.caption,
                            count: f.count,
                            desc: f.desc,
                            color: colors[barColors[colorIndex]]
                        }}))})
        }

        const chartData = {
            labels: filterList.map( d => d.caption),
            datasets: [{
                label: "Reference Counts",
                data: filterList.map( d => d.count),
                links: filterList.map( d => d.name),
                contexts: filterList.map( d => d.context),
                tooltips: filterList.map( d => d.desc),
                backgroundColor: filterList.map( d => d.color),
            }],
        }

        const chartOptions = {
            indexAxis: "y",

            tooltips: {enabled: false},

            hover: {mode: null}, // turn off automatic chart hover

            // elements: {
            //     bar: {
            //         borderWidth: 2,
            //     },
            // },

            responsive: true,

            scales: {
                y: {
                    ticks: {
                        autoSkip:false, // displays all data labels

                        // Add some leading space to tick labels
                        callback: function (value, index, ticks) {
                            return "  " + filterList[index].caption;
                        },

                        color: "dimgrey",
                        font: {
                            family: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
                            size: 15,
                            // style: "italic",
                            weight: 800,
                            lineHeight: 1.2,
                        }
                    },
                }
            },

            offset: true,

            layout: {
                padding: 0
            },

            plugins: {
                legend: false,

                tooltip: false,

                // title: {
                //     display: true,
                //     text: 'Chart.js Horizontal Bar Chart',
                // },

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
                    // // other settings for datalabels...
                    //     backgroundColor: null,
                    //     borderColor: null,
                    //     borderRadius: 4,
                    //     borderWidth: 1,
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

                },

            },

        };

        // setting selectedElement will hilite associated References Filter
        chartOptions.plugins.showSelectedElement = {
            selectedElement: selectedFilter
        }

        // Tooltip for Filter selections
        const tooltip = <MyTooltip id="my-filter-tooltip"
                                 float={true}
                                 closeOnEsc={true}
                                 delayShow={420}
                                 variant={"info"}
                                 noArrow={true}
                                 offset={5}
        />;

        overviewDisplay = <div className={"ref-filter-chart"}
           data-tooltip-id="my-filter-tooltip"
           data-tooltip-content={tooltipText}
        >
            {tooltip}
            <BarChart chartData={chartData} options={chartOptions} onAction={handleAction} onHover={handleHover} />
        </div>

    }

    return <div className={"ref-overview"}>
        <div className={"ref-overview-wrap"}>
            {overviewDisplay}
        </div>
    </div>

}