import React, {useRef} from "react";
import {Pie, getElementsAtEvent } from "react-chartjs-2";
import { getRelativePosition } from 'chart.js/helpers';

/*
expects dataset(s) to have a links property, an array of corresponding "link" keys
associated with each data value. When a pie slice is clicked, the onCLick callback
is call with the associated link value.
If the pie is clicked in the center of the donut hole, onClick is called with "all"
*/
export default function PieChart({ chartData, options, onClick }) {
    const chartRef = useRef();

    const myClick = (event) => {

        let chart = chartRef.current;

        if (getElementsAtEvent(chartRef.current, event).length > 0) {
            const datasetIndexNum = getElementsAtEvent(chartRef.current, event)[0].datasetIndex;
            const dataPoint = getElementsAtEvent(chartRef.current, event)[0].index;
            //at this point, we can pass back the "link" of the dataset being clicked
            console.log(`PIE click: element detected: ${dataPoint}`)
            const link = chartData.datasets[datasetIndexNum].links[dataPoint]
            onClick(link)
        } else {
            // if click point is in center of donut, initiate "all" selection
            console.log("PIE: clicked, no element detected")
            const {x, y} = getRelativePosition(event, chart);
            const arc = chart.getDatasetMeta(0).data[0]
            if (
                Math.abs(x - arc.x ) < arc.innerRadius
                && Math.abs(y - arc.y ) < arc.innerRadius
            ) onClick(null); // null means remove filter

        }
    }

    // text code thanks to patreon.com/chartjs
    const textCenter = {
        id: 'textCenter',
        beforeDatasetsDraw(chart, args, pluginOptions) {
            const { ctx, data } = chart;

            // get center of pie chart by getting x and y of first data point (could be any data point)
            const xCoor = chart.getDatasetMeta(0).data[0].x;
            const yCoor = chart.getDatasetMeta(0).data[0].y;

            // const totalSum = ctx.dataset.data.reduce((total, sub) => {return total + sub})
            const totalSum = data.datasets[0].data.reduce((total, sub) => {return total + sub})

            ctx.save();
            ctx.font = 'bolder 20px sans-serif';
            ctx.fillStyle = "#88878a"; //"#98AFC7"; // 'grey';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('Total', xCoor, yCoor - 20);

            ctx.font = 'bolder 40px sans-serif';
            ctx.fillStyle = "#1400ee"; // "dimgrey"
            ctx.fillText(totalSum, xCoor, yCoor + 15);

        }
    }

    console.log("loading pie chart");

    return (
        <div className="chart-container pie-chart-container">
            <Pie
                data = {chartData}
                options = {options}
                onClick = {myClick}
                ref = {chartRef}
                plugins = {[textCenter]}
            />
        </div>
    );
}
