import React from 'react';
import PieChart from "../../PieChart";
import './charts.css';
import {generateColorFade} from "../../../utils/utils";
import ChartLegend from "./ChartLegend";
import {IARE_ACTIONS} from "../../../constants/iareActions";

const BooksChart = ({pageData, options, onAction, currentState = null}) => {

    if (!pageData?.stats?.books) return <div>
        <p>No Books statistics to show.</p>
    </div>

    const booksData = Object.keys(pageData.stats.books).map(key => {
        return {
            label: key,
            count: pageData.stats.books[key],
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

    const myColors = (options?.colors ? options.colors : {})

    // const colorArray = generateColorFade(myColors.red, myColors.orange, booksData.length )
    const colorArray = generateColorFade(myColors.green, myColors.yellow, booksData.length )

    const booksChartData = {

        labels: booksData.map(d => `${d.label} [${d.count}]`),
        datasets: [
            {
                label: "Books",
                data: booksData.map(d => d.count),
                links: booksData.map(d => d.link),
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
        onAction({action: IARE_ACTIONS.SET_BOOKS_FILTER.key, value: link})
    }
    const onClickChart = (link) => {
        // console.log("pie chart clicked, link=", link)
        onAction({action: IARE_ACTIONS.SET_BOOKS_FILTER.key, value: link})
    }
    const onClickLegend = e => {
        const link = e.target.closest('.legend-entry').dataset['link'];
        // alert(`onCLickLegend: ${link}`)
        onAction({action: IARE_ACTIONS.SET_BOOKS_FILTER.key, value: link})
    }

    const booksChartOptions = {
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

        {booksChartData.datasets[0].data.length > 0
            ? <>
                <ChartLegend data={booksData} onClick={onClickLegend} currentState={currentState}
                             colors={colorArray} className={"chart-legend-books"} />

                <div className={"books-chart-display"}>
                    <PieChart chartData={booksChartData} options={booksChartOptions} onClick={onClickChart}/>
                </div>
            </>
            : <p>No Books to show.</p>}

    </>
}
export default BooksChart;