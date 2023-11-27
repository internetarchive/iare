import React from 'react';
import PieChart from "../../PieChart";

const UrlStatusChart = ({pageData, options, colors, onAction}) => {

    if (!pageData.urlStatusStatistics) {
        return <div>
            <h4>URLs</h4>
            <p>No Url statistics to show.</p>
        </div>
    }

    // remove "all" entry for pie chart
    const statsWithoutAll = pageData.urlStatusStatistics.urlCounts
        ? pageData.urlStatusStatistics.urlCounts.filter(s => s.link !== "all")
        : [];

    const onClickUrlLegend = (event, legendItem, legend) => {
        const index = legendItem.index;
        const ci = legend.chart;
        const link = ci.data.datasets[0].links[index];
        // console.log(`legend index: ${index}, link: ${link}`);

        // pass link up to passed in click routine
        onAction({action: "setUrlStatusFilter", value: link})
    }

    const myClickUrlChart = (link) => {
        // console.log("pie chart clicked, link=", link)
        onAction({action: "setUrlStatusFilter", value: link})
    }


    const urlChartData = {

        labels: statsWithoutAll.map(d => d.label),
        datasets: [{
            label: "URLs",
            data: statsWithoutAll.map(d => d.count),
            links: statsWithoutAll.map(d => d.link),
            backgroundColor: [colors.teal, colors.yellow, colors.red, colors.magenta, colors.grey,]
        }],

        borderColor: "black",
        borderWidth: 2,
    }

    const urlChartOptions = {
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
                display: true,
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
        <h4>URL Status Codes</h4>
        <h4 style={{fontStyle: "italic", fontWeight: "bold"}}>Click to filter URL List</h4>

        <div className={"url-chart-display"}>
            {urlChartData.datasets[0].data.length > 0 ?
                <PieChart chartData={urlChartData} options={urlChartOptions} onClick={myClickUrlChart}/>
                : <p>No Pie</p>}
        </div>
    </>
}

export default UrlStatusChart;