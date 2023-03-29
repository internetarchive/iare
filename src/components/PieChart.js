// src/components/PieChart.js
import React, {useRef} from "react";
import {Pie, getElementsAtEvent } from "react-chartjs-2";


/*
expects dataset(s) to have a links property, and, when the pie is clicked, the
item in the dataset corresponding to the links index is returned in the passed in
onClick function
 */
export default function PieChart({ chartData, options, onClick }) {
    const chartRef = useRef();
    const myClick = (event) => {
        if (getElementsAtEvent(chartRef.current, event).length > 0) {
            const datasetIndexNum = getElementsAtEvent(chartRef.current, event)[0].datasetIndex;
            const dataPoint = getElementsAtEvent(chartRef.current, event)[0].index;
            //at this point, we can pass back the "link" of the dataset being clicked
            const link = chartData.datasets[datasetIndexNum].links[dataPoint]
            onClick(link)
        }
    }

    return (
        <div className="chart-container">
            <Pie
                data = {chartData}
                options = {options}
                onClick = {myClick}
                ref = {chartRef}
            />
        </div>
    );
}
