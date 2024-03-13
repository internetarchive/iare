import React from 'react';
import ChartLegend from "./ChartLegend";
import {REFERENCE_STATS_MAP} from "../../../constants/referenceStatsMap";
import {IARE_ACTIONS} from "../../../constants/iareActions";


const ReferenceStats = ({pageData, options, onAction}) => {

    if (!pageData?.references) {
        return <div>
            <p>No Reference Stats to show.</p>
        </div>
    }

    // create keyed dict for counts of paeticipants in each category
    const statsData = (!pageData?.references?.length)
        ? []
        : Object.keys(REFERENCE_STATS_MAP).map(key => {
            const f = REFERENCE_STATS_MAP[key]  // f is filter to apply for counts
            const count = pageData.references.filter(
                // (f.refFilterFunction)()).length;  // NB Note the self-evaluating refFilterFunction!
                (f.refFilterFunction)().bind(null, pageData.urlDict) ).length  // NB Note the self-evaluating refFilterFunction!

            return {
                label: f.caption,
                count: count,
                link: key
            }
        })

    const onClickLegend = (e) => {
        const link = e.target.closest('.legend-entry').dataset['link'];
        onAction({action: IARE_ACTIONS.FILTER_BY_REFERENCE_STATS.key, value: link})
    }

    // const onClickPieLegend = (event, legendItem, legend) => {
    //     const index = legendItem.index;
    //     const ci = legend.chart;
    //     const link = ci.data.datasets[0].links[index];
    //     // console.log(`legend index: ${index}, link: ${link}`);
    //
    //     // pass link up to passed in click routine
    //     onAction({action: IARE_ACTIONS.FILTER_BY_REFERENCE_STATS.key, value: link})
    // }
    //
    //
    // const onClickPieChart = (link) => {
    //     // console.log("pie chart clicked, link=", link)
    //     onAction({action: IARE_ACTIONS.FILTER_BY_REFERENCE_STATS.key, value: link})
    // }

    // const colorArray = [colors.teal, colors.yellow, colors.red, colors.magenta, colors.grey,]
    const myColors = options?.colors ? options?.colors : {}
    const colorArray = [myColors.teal, myColors.yellow, myColors.red, myColors.magenta, myColors.grey,]

    // const chartData = {
    //
    //     labels: statsData.map(d => d.label),
    //     datasets: [{
    //         label: "References Stats",
    //         data: statsData.map(d => d.count),
    //         links: statsData.map(d => d.link),
    //         backgroundColor: colorArray
    //     }],
    //
    //     borderColor: "black",
    //     borderWidth: 2,
    // }

    // const chartOptions = {
    //     // animation: true,
    //     animation: {
    //         animateScale: false,
    //         animateRotate: true
    //     },
    //     maintainAspectRatio: false,
    //
    //     cutout: "50%",
    //     responsive: true,
    //     plugins: {
    //
    //         datalabels: false,
    //         legend: {
    //             display: false,
    //             position: 'top',
    //             align: 'start',
    //             // title: {
    //             //     text: "Legend",
    //             //     display: true,
    //             // },
    //             labels: {
    //                 boxWidth: 30,
    //                 boxHeight: 16,
    //                 font: {
    //                     size: 16,
    //                     family: '"Century Gothic", Futura, sans-serif',
    //                 },
    //             },
    //             onClick: onClickPieLegend,
    //         },
    //     },
    // }


    return <>
        <ChartLegend data={statsData} onClick={onClickLegend} colors={colorArray} className={"chart-legend-url_status"} />

        {/*<div className={"url-chart-display"}>*/}
        {/*    {chartData.datasets[0].data.length > 0 ?*/}
        {/*        <PieChart chartData={chartData} options={chartOptions} onClick={onClickPieChart}/>*/}
        {/*        : <p>No Pie</p>}*/}
        {/*</div>*/}
    </>
}

export default ReferenceStats;