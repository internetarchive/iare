import React from 'react';
import PieChart from "../../PieChart";
import './charts.css';
import ChartLegend from "./ChartLegend";

/*
shows piechart, for now, of tlds of urls
 */
const TldChart = ({pageData, options, onAction}) => {

    if (!pageData?.tld_statistics) return <div>
        <h4>Top Level Domains</h4>
        <p>No Top Level Domains statistics to show.</p>
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

    const tldData = Object.keys(pageData.tld_statistics).map(key => {
        return {
            label: key,
            count: pageData.tld_statistics[key],
            link: key,
        }
        }).sort((a, b) => {
            return a.count < b.count
                ? 1
                : a.count > b.count
                    ? -1
                    : a.label > b.label
                        ? 1
                        : a.label < b.label
                            ? -1
                            : 0
        })


    const tldChartData = {

        labels: tldData.map(d => `${d.label} [${d.count}]`),
        datasets: [
            {
                label: "Top Level Domains",
                data: tldData.map(d => d.count),
                links: tldData.map(d => d.link),
                backgroundColor: colorArray,
            }
        ],

        borderColor: "black",
        borderWidth: 2,
    }

    // deprecated - we no longer have chart.js draw our graph for us -we do it ourselves
            // const onClickChartLegend = (event, legendItem, legend) => {
            //     const index = legendItem.index;
            //     const ci = legend.chart;
            //     const link = ci.data.datasets[0].links[index];
            //     // console.log(`legend index: ${index}, link: ${link}`);
            //
            //     // pass link up to passed in click routine
            //     onAction({action: "setTldFilter", value: link})
            // }

    const onClickChart = (link) => {
        // console.log("pie chart clicked, link=", link)
        onAction({action: "setTldFilter", value: link})
    }

    const tldChartOptions = {
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
                // position: 'top',
                // align: 'start',
                // labels: {
                //     boxWidth: 30,
                //     boxHeight: 16,
                //     font: {
                //         size: 16
                //     },
                // },
                // onClick: onClickChartLegend,
            },
        },
    }

    const onClickLegend = e => {
        const tld = e.target.closest('.legend-entry').dataset['link'];
        // alert(`onCLickLegend: ${template}`)
        onAction({action: "setTldFilter", value: tld})
    }

    return <>
        <h4 className={`chart-title${options?.captionClass ? ` ${options.captionClass}`: ''}`}>Top Level Domains</h4>
        <h4 className={"chart-instruction"}>Click to filter URL List</h4>
        <ChartLegend data={tldData} onClick={onClickLegend} colors={colorArray} className={"chart-legend-tld"} />

        <div className={"tld-chart-display"}>
            {tldChartData.datasets[0].data.length > 0 ?
                <PieChart chartData={tldChartData} options={tldChartOptions} onClick={onClickChart}/>
                : <p>No Top Level Domains to show</p>}
        </div>
    </>
}

export default TldChart;