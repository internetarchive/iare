import React from 'react';
import PieChart from "../../PieChart";
import ChartLegend from "./ChartLegend";

const UrlStatusChart = ({pageData, options, colors, onAction}) => {

    if (!pageData.url_status_statistics) {
        return <div>
            <p>No Url statistics to show.</p>
        </div>
    }

    // assumes url_status_statistics.urlCounts is array of {label:, count:,link:} objects
    // remove "all" entry from data
    const urlStatsData = pageData.url_status_statistics.urlCounts
        ? pageData.url_status_statistics.urlCounts.filter(s => s.link !== "all")
        : [];

    const onClickUrlLegend = (event, legendItem, legend) => {
        const index = legendItem.index;
        const ci = legend.chart;
        const link = ci.data.datasets[0].links[index];
        // console.log(`legend index: ${index}, link: ${link}`);

        // pass link up to passed in click routine
        onAction({action: "setUrlStatusFilter", value: link})
    }

    const onClickLegend = e => {
        const link = e.target.closest('.legend-entry').dataset['link'];
        onAction({action: "setUrlStatusFilter", value: link})
    }


    const myClickUrlChart = (link) => {
        // console.log("pie chart clicked, link=", link)
        onAction({action: "setUrlStatusFilter", value: link})
    }

    const colorArray = [colors.teal, colors.yellow, colors.red, colors.magenta, colors.grey,]

    const urlStatsChartData = {

        labels: urlStatsData.map(d => d.label),
        datasets: [{
            label: "URLs",
            data: urlStatsData.map(d => d.count),
            links: urlStatsData.map(d => d.link),
            backgroundColor: colorArray
        }],

        borderColor: "black",
        borderWidth: 2,
    }

    const urlStatsChartOptions = {
        // animation: true,
        animation: {
            animateScale: false,
            animateRotate: true
        },
        maintainAspectRatio: false,

        cutout: "50%",
        responsive: true,
        plugins: {

            datalabels: false,
            legend: {
                display: false,
                position: 'top',
                align: 'start',
                // title: {
                //     text: "Legend",
                //     display: true,
                // },
                labels: {
                    boxWidth: 30,
                    boxHeight: 16,
                    font: {
                        size: 16,
                        family: '"Century Gothic", Futura, sans-serif',
                    },
                },
                onClick: onClickUrlLegend,
            },
            // subtitle: {
            //     display: true,
            //     text: 'Custom Chart Subtitle'
            // },
            // title: {
            //     display: true,
            //     text: 'URL Return Status Code Breakdown'
            // },


            // animation: {
            //     animateScale: false,
            //     animateRotate: false
            // },
            // animation: false,
        },
    }


    return <>
        <h4 className={"chart-instruction"}>Click to filter URL List</h4>

        <ChartLegend data={urlStatsData} onClick={onClickLegend} colors={colorArray} className={"chart-legend-url_status"} />

        <div className={"url-chart-display"}>
            {urlStatsChartData.datasets[0].data.length > 0 ?
                <PieChart chartData={urlStatsChartData} options={urlStatsChartOptions} onClick={myClickUrlChart}/>
                : <p>No Pie</p>}
        </div>
    </>
}

export default UrlStatusChart;