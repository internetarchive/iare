import React from 'react';
import PieChart from "../../PieChart";
import './charts.css';
import {generateColorFade} from "../../../utils/utils";
import ChartLegend from "./ChartLegend";

const DoiChart = ({pageData, options, onAction}) => {

    const rawData = pageData?.stats?.doi  // key-valued object of integer counts

    if (!rawData) return <div>
        <p>No Doi Statistics in Page Data.</p>
    </div>

    const dataRows = Object.keys(rawData).map(key => {
        return {
            label: key,
            count: rawData[key],
            link: key
        }
    }).sort((a, b) => {  // sort by count then by label
        return a.count < b.count ? 1 : a.count > b.count ? -1 : a.label < b.label ? 1 : a.label > b.label ? -1 : 0
    })

    const myColors = (options?.colors ? options.colors : {})  // TOD: use default colors
    const colorArray = generateColorFade(myColors.green, myColors.yellow, dataRows.length )

    const myChartData = {
        labels: dataRows.map(d => `${d.label} [${d.count}]`),
        datasets: [
            {
                label: "Books",
                data: dataRows.map(d => d.count),
                links: dataRows.map(d => d.link),
                backgroundColor: colorArray,
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
        onAction({action: "setBooksFilter", value: link})
    }
    const onClickChart = (link) => {
        // console.log("pie chart clicked, link=", link)
        onAction({action: "setBooksFilter", value: link})
    }
    const onClickLegend = e => {  // HTML elements legend
        const link = e.target.closest('.legend-entry').dataset['link'];
        // alert(`onCLickLegend: ${link}`)
        onAction({action: "setBooksFilter", value: link})
    }

    const doiChartOptions = {
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

    return <>

        {myChartData.datasets[0].data.length > 0
            ? <>
                <h4 className={"chart-instruction"}>Click to filter URL List</h4>

                <ChartLegend data={dataRows} onClick={onClickLegend}
                             colors={colorArray}
                             className={"chart-legend-doi"} />

                <div className={"doi-chart-display"}>
                    <PieChart chartData={myChartData} options={doiChartOptions} onClick={onClickChart}/>
                </div>
            </>
            : <p>No Books to show.</p>}

    </>
}
export default DoiChart;