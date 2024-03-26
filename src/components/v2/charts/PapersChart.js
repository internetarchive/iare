import React from 'react';
import './charts.css';
import {generateColorFade} from "../../../utils/utils";
import ChartLegend from "./ChartLegend";
import {IARE_ACTIONS} from "../../../constants/iareActions";

const PapersChart = ({pageData, options, onAction, currentState=null}) => {

    if (!pageData?.stats?.papers) return <div>
        <p>No Papers statistics to show.</p>
    </div>

    const myDataLabel = "Papers"
    const rawData = pageData.stats.papers
    const chartLegendClass = "chart-legend-books"

    const myData = rawData.map(d => d)  // rawData is already in desired format
        .sort((a, b) => {
        // sort it
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
    const colorArray = generateColorFade(myColors.green, myColors.yellow, myData.length )

    const myChartData = {

        labels: myData.map(d => `${d.label} [${d.count}]`),
        datasets: [
            {
                label: myDataLabel,
                data: myData.map(d => d.count),
                links: myData.map(d => d.link),
                backgroundColor: colorArray,
            }
        ],

        borderColor: "black",
        borderWidth: 2,
    }
    const onClickLegend = e => {
        const link = e.target.closest('.legend-entry').dataset['link'];
        // alert(`onCLickLegend: ${link}`)
        onAction({action: IARE_ACTIONS.SET_PAPERS_FILTER.key, value: link})
    }


    return <>

        {myChartData.datasets[0].data.length > 0
            ? <>
                <ChartLegend data={myData} onClick={onClickLegend} currentState={currentState}
                             colors={colorArray} className={chartLegendClass} />

            </>
            : <p>No Papers to show.</p>}

    </>
}
export default PapersChart;