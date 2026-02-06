import React from 'react';
// import React, {useState, useRef} from 'react';
import {ACTIONS_IARE} from "../../constants/actionsIare.jsx";
import PieChart from "../PieChart.jsx";
import ChartLegend from "./ChartLegend.jsx";

const LiveStatusChart = ({pageData, options, onAction, currentState = null}) => {

    if (!pageData?.liveStatusStats) return <div>
        <p>No Live Status to show.</p>
    </div>

    const myColors = {
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

    const colorArray = ["blue", "purple","magenta", "orange", "green", "teal" ].map( c => myColors[c])

    const liveStatusData = Object.keys(pageData.liveStatusStats).map( status => {
        return {
            label: status,
            count: pageData.liveStatusStats[status],
            link: status,
        }
    }).sort((a, b) => {
        return a.count < b.count
            ? 1
            : a.count > b.count
                ? -1
                : a.label < b.label
                    ? 1
                    : a.label > b.label
                        ? -1
                        : 0
    })

    const liveStatusChartData = {

        labels: liveStatusData.map(d => `${d.label} [${d.count}]`),
        datasets: [
            {
                label: "Top Level Domains",
                data: liveStatusData.map(d => d.count),
                links: liveStatusData.map(d => d.link),
                backgroundColor: colorArray,
            }
        ],

        borderColor: "black",
        borderWidth: 2,
    }

    const onClickChart = (link) => {
        // console.log("pie chart clicked, link=", link)
        onAction({action: ACTIONS_IARE.SET_LIVE_STATUS_FILTER.key, value: link})
    }

    const liveStatusChartOptions = {
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
            },
        },
    }

    const onClickLegend = e => {
        const liveStat = e.target.closest('.legend-entry').dataset['link'];
        onAction({action: ACTIONS_IARE.SET_LIVE_STATUS_FILTER.key, value: liveStat})
    }

    return <>
        <ChartLegend data={liveStatusData}
                     onClick={onClickLegend}
                     currentState={currentState}
                     colors={colorArray}
                     className={"chart-legend-live-status"} />

        <div className={"tld-chart-display"}>
            {liveStatusChartData.datasets[0].data.length > 0 ?
                <PieChart chartData={liveStatusChartData}
                          options={liveStatusChartOptions}
                          onClick={onClickChart}/>
                : <p>No Live Status data to show</p>}
        </div>
    </>
}

export default LiveStatusChart;
