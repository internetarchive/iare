import React from 'react';
import PieChart from "../../PieChart";
import ChartLegend from "./ChartLegend";
import {LINK_STATUS_MAP} from "../../../constants/linkStatusMap";

const LinkStatusChart = ({pageData, options, onAction, currentState = null}) => {

    if (!pageData?.urlArray?.length) return <div>
        <p>No Link Status statistics to show.</p>
    </div>

    const linkStatusData = (!pageData?.urlArray?.length)
        ? []
        : Object.keys(LINK_STATUS_MAP).map(key => {
            const f = LINK_STATUS_MAP[key];
            const count = pageData.urlArray.filter((f.filterFunction)()).length; // NB Note the self-evaluating filterFunction!
            return {
                label: f.caption,
                count: count,
                link: key
            }
        })

    const myColors = {blue: "#35a2eb", darkBlue: "#1169a5", red: "#ff6384", teal: "#4bc0c0", orange: "#ff9f40", purple: "#9866ff", yellow: "#ffcd57", green: "#5bbd38", grey: "#c9cbcf", magenta: "#f763ff", black: "#000000", white: "#FFFFFF"}
    const colorArray = [ myColors.teal, myColors.red ]

    const linkStatusChartData = {

        labels: linkStatusData.map(d => `${d.label} [${d.count}]`),
        datasets: [
            {
                label: "Link Status",
                data: linkStatusData.map(d => d.count),
                links: linkStatusData.map(d => d.link),
                backgroundColor: colorArray,
            }
        ],

        borderColor: "black",
        borderWidth: 2,
    }

    const onClickChart = (link) => {
        // console.log("pie chart clicked, link=", link)
        onAction({action: "setLinkStatusFilter", value: link})
    }

    const linkStatusChartOptions = {
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
            }
        },
    }

    const onClickLegend = e => {
        const linkStatus = e.target.closest('.legend-entry').dataset['link'];
        onAction({action: "setLinkStatusFilter", value: linkStatus})
    }

    return <>
        <ChartLegend data={linkStatusData} onClick={onClickLegend} currentState={currentState}
                     colors={colorArray} className={"chart-legend-link-status"} />

        <div className={"link-status-chart-display"}>
            {linkStatusChartData.datasets[0].data.length > 0 ?
                <PieChart chartData={linkStatusChartData} options={linkStatusChartOptions} onClick={onClickChart}/>
                : <p>No Link Status to show</p>}
        </div>
    </>
}

export default LinkStatusChart;