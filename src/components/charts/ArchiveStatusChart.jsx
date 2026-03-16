import React from 'react';
import PieChart from "../PieChart.jsx";
import ChartLegend from "./ChartLegend.jsx";
import {ACTIONS_IARE} from "../../constants/actionsIare.jsx";
import {LINK_STATUS_MAP} from "../../constants/linkStatusMap.jsx";
import {isLinkStatusGood} from "../../utils/generalUtils.js";
import {ARCHIVE_STATUS_MAP} from "../../constants/archiveStatusMap.jsx";

const ArchiveStatusChart = ({pageData, options, onAction, currentState = null}) => {

    if (!pageData?.urlArray?.length) return <div>
        <p>No Link Status statistics to show.</p>
    </div>

    // const archiveStatusData =
    //     [
    //         {
    //             label: "Has Archive",
    //             count: 12,
    //             link: "archive"
    //         },
    //         {
    //             label: "No Archive",
    //             count: 4,
    //             link: "no_archive"
    //         }
    //
    //     ]

    const archiveStatusData = (!pageData?.urlArray?.length)
        ? []
        : Object.keys(ARCHIVE_STATUS_MAP).map(key => {
            const f = ARCHIVE_STATUS_MAP[key];
            const count = pageData.urlArray.filter((f.filterFunction)()).length; // NB Note the self-evaluating filterFunction!
            return {
                label: f.caption,
                count: count,
                link: key
            }
        })


    const myColors = {blue: "#35a2eb", darkBlue: "#1169a5", red: "#ff6384", teal: "#4bc0c0", orange: "#ff9f40", purple: "#9866ff", yellow: "#ffcd57", green: "#5bbd38", grey: "#c9cbcf", magenta: "#f763ff", black: "#000000", white: "#FFFFFF"}
    const colorArray = [ myColors.teal, myColors.red ]

    const archiveStatusChartData = {

        labels: archiveStatusData.map(d => `${d.label} [${d.count}]`),
        datasets: [
            {
                label: "Archive Status",
                data: archiveStatusData.map(d => d.count),
                links: archiveStatusData.map(d => d.link),
                backgroundColor: colorArray,
            }
        ],

        borderColor: "black",
        borderWidth: 2,
    }

    const onClickChart = (link) => {
        // console.log("archive status chart clicked, link=", link)
        onAction({action: ACTIONS_IARE.SET_ARCHIVE_STATUS_FILTER.key, value: link})
    }

    const archiveStatusChartOptions = {
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
        const archiveStatus = e.target.closest('.legend-entry').dataset['link'];
        onAction({action: ACTIONS_IARE.SET_ARCHIVE_STATUS_FILTER.key, value: archiveStatus})
    }

    return <>
        <ChartLegend data={archiveStatusData} onClick={onClickLegend} currentState={currentState}
                     colors={colorArray} className={"chart-legend-link-status"} />

        <div className={"archive-status-chart-display"}>
            {archiveStatusChartData.datasets[0].data.length > 0 ?
                <PieChart chartData={archiveStatusChartData} options={archiveStatusChartOptions} onClick={onClickChart}/>
                : <p>No Archive Status to show</p>}
        </div>
    </>
}

export default ArchiveStatusChart;