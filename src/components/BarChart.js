import React, {useRef} from 'react';
import { Bar } from 'react-chartjs-2';
import { getElementsAtEvent } from 'react-chartjs-2';
import { Chart } from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels';
Chart.register(ChartDataLabels)


// returns -1 if cursor not over valid index
const getElementIndexAtCursor = (xCursor, yCursor, chart) => {
    const { chartArea } = chart;

    const elementData = chart._metasets[0].data;
    const numElements = elementData.length;

    const chartHeight = chartArea.height;
    const elementHeight = chartHeight/numElements;

    // use top and bottom boundaries of chart area and number of intervals to calculate index

    let foundIndex = -1;

    if (yCursor < chartArea.top || yCursor > chartArea.bottom) {
        foundIndex = -1;
    } else {
        let checkLineY = chartArea.top;
        elementData.every( (d, elementIndex) => {
            checkLineY = chartArea.top + ((elementIndex + 1) * elementHeight); // extreme border of element

            if (yCursor < checkLineY) {
                foundIndex = elementIndex;
                return false; // break with current value of foundIndex
            }

            return true; // continue with every
        })
    }

    return foundIndex;
}

// returns { left: , top: , width: , height: }
const getCursorBoxForElement = (elementIndex, chart) => {
    const { chartArea } = chart;

    const elementData = chart._metasets[0].data;
    const numElements = elementData.length;

    const chartHeight = chartArea.height;
    const elementHeight = chartHeight/numElements;

    if (elementIndex < 0) return null;

    const padding = 1;
    const left = 0 + padding; // left of entire chart area including labels
    const width = chart.width - ( 2 * padding);
    return {
        left: left,
        top: chartArea.top + (elementIndex * elementHeight) - padding,
        width: width,
        height: elementHeight + (2 * padding),
    }
}

// all indexed data have a link-context value which is unique.
// selectedElement is assumed to be: [ <link>, <context> ]
const getIndexFromLinkContext = (selectedElement, chart) => {
    let foundIndex = -1;

    if (!selectedElement || !selectedElement.length) return foundIndex;

    // loop thru data; return when link and context match
    const links = chart.config._config.data.datasets[0].links;
    const contexts = chart.config._config.data.datasets[0].contexts;
    links.every( (link, index ) => {
        if (link === selectedElement[0]) {
            if (contexts[index] === selectedElement[1]) {
                foundIndex = index;
                return false; // break out of every loop
            }
        }
        return true;
    })

    return foundIndex;
}

// const lightGreen = `rgba(128, 217, 202, .1)`;
const lightBlue = `rgba(0,45,254,0.1)`;
const lightGrey = `rgba(128, 128, 128, 0.15)`;
const selectedBoxColor = lightGrey;
const cursorBoxColor = lightBlue;



export default function BarChart({ chartData, options, onAction, onHover }) {

    const myChartRef = useRef();

    const handleClick = (event) => {
        const chart = myChartRef.current;

        if (getElementsAtEvent(chart, event).length > 0) {
            const dataPoint = getElementsAtEvent(chart, event)[0].index;
            const link = chart.data.datasets[0].links[dataPoint]
            const context = chart.data.datasets[0].contexts[dataPoint]

            // // TODO: ERROR what to do when link not found in links array?
            // i think the link and context will just be undefined

            onAction(link, context);

        } else {
            // no chart element clicked...try to interpret click as
            // link and context based on row being hovered over.

            const { canvas } = chart;
            const rect = canvas.getBoundingClientRect();
            const xCursor = event.clientX - rect.left;
            const yCursor = event.clientY - rect.top;

            const foundIndex = getElementIndexAtCursor(xCursor, yCursor, chart)

            const link = chart.data.datasets[0].links[foundIndex]
            const context = chart.data.datasets[0].contexts[foundIndex]

            onAction(link, context)
        }
    }

    // code inspiration  thanks to patreon.com/chartjs
    const HoverDataBar = {
        // default events: ['mousemove', 'mouseout', 'click', 'touchstart', 'touchmove'],
        // TODO: honor touch events

        id: 'hoverDataBar',

        beforeEvent(chart, args, pluginOptions) {
            const event = args.event;
            const { ctx, canvas } = chart;

            if (!['mousemove', 'mouseout'].includes(event.type)) {
                return;
            }

            if (event.type === 'mouseout') {
                // process the event - essentially "erase" cursor
                chart.draw();
            }

            if (event.type === 'mousemove') {

                const rect = canvas.getBoundingClientRect();
                const xCursor = event.native.clientX - rect.left;
                const yCursor = event.native.clientY - rect.top;

                const foundIndex = getElementIndexAtCursor(xCursor, yCursor, chart)

                // send the tooltip text up to the caller if cursor is over label area
                onHover( xCursor < chart.chartArea.left && foundIndex > -1
                    ? chart.config._config.data.datasets[0].tooltips[foundIndex]
                    : '');

                // get box coords of item indicated by foundIndex
                const cursorBox = getCursorBoxForElement(foundIndex, chart)
                if (!cursorBox) return;

                // draw our chart, essentially "erasing" previous cursor...
                chart.draw();

                // ...and then draw our overlay cursor with border
                ctx.fillStyle = cursorBoxColor;
                ctx.fillRect(cursorBox.left, cursorBox.top, cursorBox.width, cursorBox.height);
                ctx.strokeRect(cursorBox.left, cursorBox.top, cursorBox.width, cursorBox.height);

                // TODO: redraw label text with font specs from _data[labels] info, but change color to blue
            }
        },

    };

    // indicates selected item with a "permanent" cursor
    const ShowSelectedElement = {
        id: 'showSelectedElement',
        afterDraw(chart, args, options) {
            const pluginOptions = chart.config.options.plugins.showSelectedElement;
            const selectedElement = pluginOptions ? pluginOptions.selectedElement : [];
            const myIndex = getIndexFromLinkContext(selectedElement, chart);

            if (myIndex > -1) {
                const cursorBox = getCursorBoxForElement(myIndex, chart)
                if (!cursorBox) return;
                const { ctx } = chart;
                ctx.fillStyle = selectedBoxColor;
                ctx.fillRect(cursorBox.left, cursorBox.top, cursorBox.width, cursorBox.height);
                ctx.strokeRect(cursorBox.left, cursorBox.top, cursorBox.width, cursorBox.height);
            }
        },
    }

    return (
        <div className="chart-container bar-chart-container">
            <Bar
                data={chartData}
                options={options}
                onClick={handleClick}
                ref={myChartRef}

                plugins = {[ChartDataLabels, HoverDataBar, ShowSelectedElement]}
            />
        </div>
    );
}