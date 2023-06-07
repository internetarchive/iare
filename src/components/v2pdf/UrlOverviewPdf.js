import React, {useEffect, useState} from 'react';
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

    const [checkboxes, setCheckboxes] = useState({
        chkAnnotation: true,
        chkContent: true,
    });

    // when checkboxes change, set the origin filter
    // TODO: this is a very inelegant way of setting the origin!
    useEffect( () => {
        const value = (checkboxes.chkAnnotation && checkboxes.chkContent) ?
            'AC'
            : checkboxes.chkAnnotation ? 'A'
            : checkboxes.chkContent ? 'C' : '';

        // const value = 'AC';
        //
        onAction( { action: "setOriginFilter", value: value } )

     }, [checkboxes, onAction])
    

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



    const handleCheckboxChange = (event) => {
        const { name, checked } = event.target;
        setCheckboxes((prevCheckboxes) => ({
            ...prevCheckboxes,
            [name]: checked, // checked will be a true or false value
        }));
    }



    const originChoices = Object.keys(origins).map( origin => {
        const o = origins[origin];
        return <div key={origin} >
            <label>
                <input
                    type="checkbox"
                    name={o.name}
                    checked={checkboxes[o.name]}
                    onChange={handleCheckboxChange}
                />
                {o.caption}
            </label>
            <br />
        </div>
    })

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