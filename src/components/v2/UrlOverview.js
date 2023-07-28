import React from 'react';
import FilterButtons from "../FilterButtons";
import {REF_LINK_STATUS_FILTERS} from "./filters/refFilterMaps";
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
    blue: "#35a2eb",
    red: "#ff6384",
    teal: "#4bc0c0",
    orange: "#ff9f40",
    purple: "#9866ff",
    yellow: "#ffcd57",
    grey: "#c9cbcf",
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
const UrlOverview = React.memo(({pageData, statistics, onAction}) => {

    if (!statistics) {
        return <div>
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
        onAction({action: "setFilter", value: link})
    }

    const myClickChart = (link) => {
        // console.log("pie chart clicked, link=", link)
        onAction({action: "setFilter", value: link})
    }


    const chartData = {

        labels: statsWithoutAll.map(d => d.label),
        datasets: [{
            label: "URLs",
            data: statsWithoutAll.map(d => d.count),
            links: statsWithoutAll.map(d => d.link),
            backgroundColor: [colors.teal, colors.yellow, colors.red, colors.magenta, colors.grey,]
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
                labels: {
                    boxWidth: 30,
                    boxHeight: 16,
                    font: {
                        size: 16
                    },
                },
                onClick: onClickLegend,
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

    // // debug display for chartData
    // return <div>
    //     <h4>Urls</h4>
    //     <RawJson obj={chartData} />
    // </div>

    const handleLinkAction = (linkStatus) => {
        onAction({
            action: "setLinkStatusFilter", value: linkStatus,
        })
    }

    // callback for button render function of <FilterButton>
    const renderLinkStatusButton = (props) => {
        return <>
            {props.filter.lines.map( line => {
                return <div>{line}</div>
            })}
            <div className={`filter-link-status-wrapper`}>
                <span className={`link-status link-status-${props.filter.name}`} />
            </div>
            <div className={'filter-count'}>{props.filter.count}</div>
        </>

    }
    const linkStatusFilters = <div className={"filters-link-status"}>
        <FilterButtons
            flock={pageData.references}
            filterMap={REF_LINK_STATUS_FILTERS}
            filterList={[]}
            onClick={(e) => {
                handleLinkAction(e)
            }}
            caption=''
            className="link-status-filter-buttons"
            currentFilterName=''
            onRender={renderLinkStatusButton}
        />
    </div>

    const urlStatusCaption = <>
        <h4>URL Status Codes</h4>
        <h4 style={{fontStyle: "italic", fontWeight: "bold"}}>Click to filter URL List</h4>
    </>
    const linkStatusCaption = <>
        <h4>Citation Link Statuses</h4>
        <h4 style={{fontStyle: "italic", fontWeight: "bold"}}>Click to filter References List</h4>
    </>

    return <div className={"url-overview"}>

        <div className={'section-sub'}>
            {urlStatusCaption}
            <div className={"url-chart-display"}>
                {chartData.datasets[0].data.length > 0 ?
                    <PieChart chartData={chartData} options={options} onClick={myClickChart}/>
                    : <p>No Pie</p>}
            </div>
        </div>

        <div className={'section-sub'}>
            {linkStatusCaption}
            {linkStatusFilters}
        </div>
    </div>

})

export default UrlOverview;