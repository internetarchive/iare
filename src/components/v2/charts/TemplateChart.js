import React from 'react';
import PieChart from "../../PieChart";
import './charts.css';
import {generateColorFade} from "../../../utils/utils";
import ChartLegend from "./ChartLegend";

const TemplateChart = ({pageData, options, onAction}) => {

    if (!pageData?.stats?.templates) return <div>
        <p>No Template statistics to show.</p>
    </div>

    const templateData = Object.keys(pageData.stats.templates).map(key => {
        return {
            label: key,
            count: pageData.stats.templates[key],
            link: key
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

    const myColors = {blue: "#35a2eb", darkBlue: "#1169a5", red: "#ff6384", teal: "#4bc0c0", orange: "#ff9f40", purple: "#9866ff", yellow: "#ffcd57", green: "#5bbd38", grey: "#c9cbcf", magenta: "#f763ff", black: "#000000", white: "#FFFFFF"}

    // const colorArray = [colors.teal, colors.yellow, colors.red, colors.magenta, colors.grey,]
    // const colorArray = [colors.teal, colors.yellow]
    const colorArray = generateColorFade(myColors.blue, myColors.green, templateData.length )

    const templateChartData = {

        labels: templateData.map(d => `${d.label} [${d.count}]`),
        datasets: [
            {
                label: "Templates",
                data: templateData.map(d => d.count),
                links: templateData.map(d => d.link),
                backgroundColor: colorArray,
                // TODO: make better colors here...
            }
        ],

        borderColor: "black",
        borderWidth: 2,
    }

    const onClickTemplateLegend = (event, legendItem, legend) => {
        const index = legendItem.index;
        const ci = legend.chart;
        const link = ci.data.datasets[0].links[index];
        // console.log(`legend index: ${index}, link: ${link}`);

        // pass link up to passed in click routine
        onAction({action: "setTemplateFilter", value: link})
    }
    const onClickTemplateChart = (link) => {
        // console.log("pie chart clicked, link=", link)
        onAction({action: "setTemplateFilter", value: link})
    }

    const templateChartOptions = {
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
                        size: 16
                    },
                },
                onClick: onClickTemplateLegend,
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

    const onClickLegend = e => {

        const template = e.target.closest('.legend-entry').dataset['link'];
        // alert(`onCLickLegend: ${template}`)
        onAction({action: "setTemplateFilter", value: template})
    }

    return <>
        <h4 className={"chart-instruction"}>Click to filter URL and References Lists</h4>

        <ChartLegend data={templateData} onClick={onClickLegend} colors={colorArray} className={"chart-legend-templates"} />

        <div className={"template-chart-display"}>
            {templateChartData.datasets[0].data.length > 0 ?
                <PieChart chartData={templateChartData} options={templateChartOptions} onClick={onClickTemplateChart}/>
                : <p>No Template Pie</p>}
        </div>
    </>
}

export default TemplateChart;