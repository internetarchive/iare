import React, {useState} from 'react';
import PieChart from "../PieChart";
import {
    Chart,
    LinearScale,
    BarElement,
    ArcElement,
    Legend,
    Tooltip,
    Title,
    SubTitle,
    Colors,
} from 'chart.js'

Chart.register(
    LinearScale,
    BarElement,
    ArcElement,
    Legend,
    Tooltip,
    Title,
    SubTitle,
    Colors,
);

const colors = {
    blue   : "#35a2eb",
    red    : "#ff6384",
    teal   : "#4bc0c0",
    orange : "#ff9f40",
    purple : "#9866ff",
    yellow : "#ffcd57",
    grey   : "#c9cbcf",
    magenta: "#f763ff",
}

/* assumed structure of overview object:

    { urlCounts : [
        {
            label:,
            count:,
            link:
        }
        ,...
        ]
    }
*/
export default function UrlOverviewPdf ({ statistics, origins={}, onAction } ) {

    const [originCheckboxes, setOriginCheckboxes] = useState({
        chkAnnotation: true,
        chkContent: true,
        chkBlock: true,
    });

    const setOriginAction = (checkboxes) => {
        // includedTags is an array of tag strings associated with origin source
        // it is used by the filtering of the URLs when passed back with onAction
        const includedTags = Object.keys(origins).filter( origin => {
            console.log("inside included tags")
            return checkboxes[origins[origin].name]
        }).map(origin => origins[origin].tag);

        onAction( { action: "setOriginFilter", value: includedTags } )
    }

    const handleCheckboxChange = (event) => {
        const { name, checked } = event.target;
        const checkboxes = {...originCheckboxes, [name]: checked} // change targeted entry only
        setOriginAction(checkboxes)
        setOriginCheckboxes(checkboxes)
    }

    const originChoices = Object.keys(origins).map( origin => {
        const o = origins[origin];
        return <div key={origin} >
            <label>
                <input
                    type="checkbox"
                    name={o.name}
                    checked={originCheckboxes[o.name]} // checkboxes[o.name] is true or false
                    onChange={handleCheckboxChange}
                />
                {o.caption}
            </label>
            <br />
        </div>
    })



    if (!statistics) { return <div>
        <h4>Urls</h4>
        <p>No Url statistics to show.</p>
    </div>
    }


    // remove "all" entry for pie chart
    const statsWithoutAll = statistics.urlCounts
        ? statistics.urlCounts.filter(s => s.link !== "all")
        : [];

    const onClickLegend = (event, legendItem, legend) => {
        const index = legendItem.index;
        const ci = legend.chart;
        const link = ci.data.datasets[0].links[index];
        // console.log(`legend index: ${index}, link: ${link}`);

        // pass link up to passed in click routine
        onAction( {action:"setFilter", value:link})
    }

    const myClickChart = (link) => {
        // console.log("pie chart clicked, link=", link)
        onAction( {action:"setFilter", value:link})
    }


    const chartData = {

        labels: statsWithoutAll.map( d => d.label),
        datasets: [{
            label: "URLs",
            data: statsWithoutAll.map( d => d.count),
            links: statsWithoutAll.map( d => d.link),
            backgroundColor: [ colors.teal, colors.yellow, colors.red, colors.magenta, colors.grey, ]
        }],

        borderColor: "black",
        borderWidth: 2,
    }

    const options = {
        cutout: "50%",
        responsive: true,
        plugins: {
            datalabels: false,
            legend: {
                display: true,
                position: 'top',
                align: 'start',
                // title: {
                //     text: "Legend",
                //     display: true,
                // },
                labels : {
                    boxWidth : 30,
                    boxHeight : 16,
                    font: {
                        size: 16
                    },
                },
                onClick : onClickLegend,
            },
            // subtitle: {
            //     display: true,
            //     text: 'Custom Chart Subtitle'
            // },
            // title: {
            //     display: true,
            //     text: 'URL Return Status Code Breakdown'
            // },
            animation: {
                animateScale: true,
                animateRotate: true
            },
        },
    }





    return <div className={"url-overview"}>
        <h4>URL Status Codes</h4>
        <div className={"url-chart-display"}>
            {chartData.datasets[0].data.length > 0 ?
                <PieChart chartData={chartData} options={options} onClick={myClickChart} />
                : <p>No Pie</p>}
        </div>

        <div className={'pdf-link-origin'}>
            <h4>Origin of Links</h4>
            <div className={'origin-choices'}>
                 {originChoices}
            </div>
        </div>
    </div>

}