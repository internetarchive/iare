import React from 'react';
import PieChart from "../../PieChart";
import './charts.css';
import {generateColorFade} from "../../../utils/utils";
import ChartLegend from "./ChartLegend";
import {IARE_ACTIONS} from "../../../constants/iareActions";

const TemplateChart = ({pageData, options, onAction, currentState=null}) => {

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
        onAction({action: IARE_ACTIONS.SET_TEMPLATE_FILTER.key, value: link})
    }
    const onClickTemplateChart = (link) => {
        // console.log("pie chart clicked, link=", link)
        onAction({action: IARE_ACTIONS.SET_TEMPLATE_FILTER.key, value: link})
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
        onAction({action: IARE_ACTIONS.SET_TEMPLATE_FILTER.key, value: template})
    }

    return <>
        <ChartLegend data={templateData} onClick={onClickLegend} currentState={currentState}
                     colors={colorArray} className={"chart-legend-templates"} />

        <div className={"template-chart-display"}>
            {templateChartData.datasets[0].data.length > 0 ?
                <PieChart chartData={templateChartData} options={templateChartOptions} onClick={onClickTemplateChart}/>
                : <p>No Template Pie</p>}
        </div>
    </>
}

export default TemplateChart;