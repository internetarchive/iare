import React, {useRef} from 'react';
import {getElementsAtEvent, Bar} from 'react-chartjs-2';

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

export default function BarChart({ chartData, options, onClick }) {

    const chartRef2 = useRef();

    const myClick = (event) => {
        if (getElementsAtEvent(chartRef2.current, event).length > 0) {
            const datasetIndexNum = getElementsAtEvent(chartRef2.current, event)[0].datasetIndex;
            const dataPoint = getElementsAtEvent(chartRef2.current, event)[0].index;
            //at this point, we can pass back the "link" of the dataset being clicked
            const link = chartData.datasets[datasetIndexNum].links[dataPoint]
            // TODO: ERROR wha to do when links is not there?

            onClick(link)
        }
    }

    return (
        <div className="chart-container">
            <Bar
                data={chartData}
                options={options}
                onClick={myClick}
                ref={chartRef2}
            />
        </div>
    );
}