import React, {useRef} from 'react';
import { Bar } from 'react-chartjs-2';
import { getElementsAtEvent } from 'react-chartjs-2';
import { Chart } from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels';
// import { getRelativePosition } from 'chart.js/helpers';
Chart.register(ChartDataLabels,)

// example chartData:
//
// const state = {
//     labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
//     datasets: [
//         {
//             label: 'My First dataset',
//             backgroundColor: 'rgba(255,99,132,0.2)',
//             borderColor: 'rgba(255,99,132,1)',
//             borderWidth: 1,
//             hoverBackgroundColor: 'rgba(255,99,132,0.4)',
//             hoverBorderColor: 'rgba(255,99,132,1)',
//             data: [65, 59, 80, 81, 56, 55, 40]
//         }
//     ]
// }

export default function BarChart({ chartData, options, onAction }) {

    const myChartRef = useRef();

    // const myHover = (event, chartElement) => {
    //     console.log("barchart mousemove")
    //
    //     const myChart = myChartRef.current;
    //
    //     // event.target.style.cursor = chartElement[0] ? 'pointer' : 'default';
    //     const rect = event.target.getBoundingClientRect();
    //     const x = event.clientX - rect.left;
    //     const y = event.clientY - rect.top;
    //     const ctx = event.target.getContext('2d');
    //     // ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    //     ctx.save();
    //     ctx.fillStyle = 'rgba(0,0,0, 0.5)';
    //     ctx.fillRect(x - 25, y - 25, 50, 50);
    // }

                        // const myMouseMove = (event) => {
                        //
                        //     const myChart = myChartRef.current;
                        //
                        //     const { canvas, scales: {scaleX,scaleY}} = myChart;
                        //
                        //     console.log("barchart mousemove")
                        //
                        //     // const rect1 = event.target.getBoundingClientRect();
                        //     const rect = canvas.getBoundingClientRect();
                        //
                        //     const xCursor = event.clientX - rect.left;
                        //     const yCursor = event.clientY - rect.top;
                        //     const ctx = event.target.getContext('2d');
                        //
                        //     // // ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                        //     // ctx.save();
                        //     // ctx.fillStyle = 'rgba(0,0,0, 0.5)';
                        //     // ctx.fillRect(x - 25, y - 25, 50, 50);
                        //     // ctx.restore()
                        // }

    const handleClick = (event) => {
        const myChart = myChartRef.current;

        if (getElementsAtEvent(myChart, event).length > 0) {
            // const datasetIndexNum = getElementsAtEvent(myChart, event)[0].datasetIndex;
            const dataPoint = getElementsAtEvent(myChart, event)[0].index;

            //alert("BarChart myClick: dataPoint = " + dataPoint)

            const link = myChart.data.datasets[0].links[dataPoint]
            const context = myChart.data.datasets[0].contexts[dataPoint]
            // //at this point, we can pass back the "link" of the dataset being clicked
            // const link = chartData.datasets[datasetIndexNum].links[dataPoint]
            // // TODO: ERROR wha to do when links is not there?
            //

            onAction(link, context);

        } else {
            console.log(`barchart click`)
            // no element found...

    // const myData = myChart.data.datasets[0];
    // // myData:: .backgroundColor, .data, .label(only one), .links, .contexts
    //
    // // chart.setActiveElements([
    // //     {datasetIndex: 0, index: 1},
    // // ]);
    // //
    // const {x, y} = getRelativePosition(event, myChart);
    // const chartMeta0 = myChart.getDatasetMeta(0).data[0]
    // const chartMeta8 = myChart.getDatasetMeta(0).data[8]
    // const chartMeta13 = myChart.getDatasetMeta(0).data[13]
    //
    // console.log(`chartMeta 0,8,13:`)
    // console.log(chartMeta0)
    // console.log(chartMeta8)
    // console.log(chartMeta13)

    // calculate dataPoint from horizontal row

            // console.log(`BarChart click: x,y: ${x},${y}`)
            // console.log(`myChart.scales.y,._gridLineItems:`)
            // console.log(myChart.scales.y)
            // console.log(myChart.scales.y._gridLineItems)


            // print out top and bottom of each dataset

            //alert(`BarChart::handleClick: off-chart area`)

        }

        // alert("BarChart myClick")
    }

    // text code thanks to patreon.com/chartjs
    const HoverDataBar = {
            // these are the default events:
            // events: ['mousemove', 'mouseout', 'click', 'touchstart', 'touchmove'],

        id: 'HoverDataBar',
        beforeEvent(chart, args, pluginOptions) {
            const event = args.event;
            // const { ctx, canvas, scales, height, width } = chart;
            const { ctx, canvas } = chart;

            if (!['mousemove', 'mouseout'].includes(event.type)) {
                return;
            }

            if (event.type === 'mouseout') {
                // process the event
            }
            if (event.type === 'mousemove') {
                // process the event

                // console.log(`HoverDataBar: mousemove `)

    const rect = canvas.getBoundingClientRect();
    const xCursor = event.native.clientX - rect.left;
    const yCursor = event.native.clientY - rect.top;
    // // const ctx = args.event.target.getContext('2d');
    //
    // // console.log(`HoverDataBar: mousemove x,y ${xCursor}, ${yCursor}`)

                chart.draw();

                ctx.fillStyle = `rgba(0,45,254,0.2)`;
                ctx.fillRect(xCursor - 25, yCursor - 12, 150, 25);
                ctx.strokeRect(xCursor - 25, yCursor - 12, 150, 25);
            }
        }
    };

    return (
        <div className="chart-container bar-chart-container">
            <Bar
                data={chartData}
                options={options}
                onClick={handleClick}
                // onMouseMove={myMouseMove}
                ref={myChartRef}

                // plugins = {[
                //     ChartDataLabels,
                //     HoverDataBar
                // ]}
                plugins = {[ChartDataLabels, HoverDataBar]}

            />
        </div>
    );
}