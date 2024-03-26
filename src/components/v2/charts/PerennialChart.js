import React from 'react';
import PieChart from "../../PieChart";
import './charts.css';
// import {generateColorFade} from "../../../utils/utils";
import {rspMap} from "../../../constants/perennialList";
import ChartLegend from "./ChartLegend";
import {IARE_ACTIONS} from "../../../constants/iareActions";

/*
shows piechart, for now, of links associated with perennial categories
 */
const PerennialChart = ({pageData, options, onAction, currentState = null}) => {

    if (!pageData?.rsp_statistics) return <div>
        <p>No Perennial Source statistics to show.</p>
    </div>

    const myColors = {blue: "#35a2eb", darkBlue: "#1169a5", red: "#ff6384", teal: "#4bc0c0", orange: "#ff9f40", purple: "#9866ff", yellow: "#ffcd57", green: "#5bbd38", grey: "#c9cbcf", magenta: "#f763ff", black: "#000000", white: "#FFFFFF"}

    // const barColors = ["magenta", "purple", "blue", "teal","yellow","orange","red"]

    const myRspMap = rspMap

    const perennialData = Object.keys(pageData.rsp_statistics).map(key => {
        return {
            label: myRspMap[key].caption,
            count: pageData.rsp_statistics[key],
            link: key,
            color: myRspMap[key]?.color
        }
    })
    // // do not sort, for now...
    //     .sort((a, b) => {
    //     return a.count < b.count
    //         ? 1
    //         : a.count > b.count
    //             ? -1
    //             : a.label > b.label
    //                 ? 1
    //                 : a.label < b.label
    //                     ? -1
    //                     : 0
    // })

    //    const colorArray = generateColorFade(myColors.orange, myColors.green, perennialData.length )
    const colorArray = perennialData.map(d => myColors[d.color])

    const perennialChartData = {

        labels: perennialData.map(d => `${d.label} [${d.count}]`),
        datasets: [
            {
                label: "Perennials",
                data: perennialData.map(d => d.count),
                links: perennialData.map(d => d.link),
                backgroundColor: colorArray,
                // TODO: make better colors here...
            }
        ],

        borderColor: "black",
        borderWidth: 2,
    }

    const onClickChartLegend = (event, legendItem, legend) => {
        const index = legendItem.index;
        const ci = legend.chart;
        const link = ci.data.datasets[0].links[index];
        // console.log(`legend index: ${index}, link: ${link}`);

        // pass link up to passed in click routine
        onAction({action: IARE_ACTIONS.SET_PERENNIAL_FILTER.key, value: link})
    }
    const onClickChart = (link) => {
        // console.log("pie chart clicked, link=", link)
        onAction({action: IARE_ACTIONS.SET_PERENNIAL_FILTER.key, value: link})
    }

    const perennialChartOptions = {
        // animation: true,
        animation: {
            animateScale: false,
            animateRotate: true
        },
        maintainAspectRatio: false,  // fixes chromebook infinite animation bug

        cutout: "50%",
        responsive: true,
        plugins: {
            datalabels: false,
            legend: {
                display: false,
                position: 'top',
                align: 'start',
                labels: {
                    boxWidth: 30,
                    boxHeight: 16,
                    font: {
                        size: 16
                    },
                },
                onClick: onClickChartLegend,
            },
        },
    }

    const onClickLegend = e => {
        const perennial = e.target.closest('.legend-entry').dataset['link'];
        // alert(`onCLickLegend: ${template}`)
        onAction({action: IARE_ACTIONS.SET_PERENNIAL_FILTER.key, value: perennial})
    }

    return <>
        {/*<h4 className={"chart-instruction"}>Click to filter URL List</h4>*/}
        <ChartLegend data={perennialData} onClick={onClickLegend} currentState={currentState}
                     colors={colorArray} className={"chart-legend-perennial"} />

        <div className={"perennial-chart-display"}>
            {perennialChartData.datasets[0].data.length > 0 ?
                <PieChart chartData={perennialChartData} options={perennialChartOptions} onClick={onClickChart}/>
                : <p>No Perennial Sources to show</p>}
        </div>
    </>
}

export default PerennialChart;