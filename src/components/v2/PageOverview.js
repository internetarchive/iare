import React, {useState} from "react";
import FilterButton from "../FilterButton";
import { URL_FILTER_MAP } from './filterMaps.js';
import PieChart from "../PieChart.js";
// import BarChart from "../BarChart.js";

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
    Colors);

        // the following two lines will register all chart.js things
        // import { Chart, registerables } from 'chart.js';
        // Chart.register(...registerables);

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

const REF_FILTER_MAP = {
    All: {
        caption: "Show All Refs",
        desc: "no filter",
        filter: () => () => {return true},
    },
    // Plain: {
    //     caption: "Show Refs with Plain Text",
    //     desc: "plain_text_in_reference = true",
    //     filter: (d) => d.plain_text_in_reference,
    // },
    NamedTemplate: {
        caption: "Named Templates",
        desc: 'template_names[]',
        filter: () => (d) => {return d.template_names.length > 0},
    },
    CiteWeb: {
        caption: "Cite Web",
        desc: "template_names[] contains 'cite web'",
        filter: () => (d) => {
            return d.template_names.includes("cite web");
        },
    },
    CiteMap: {
        caption: "Cite Map",
        desc: "template_names[] contains 'cite map'",
        filter: () => (d) => {
            return d.template_names.includes("cite map");
        },
    },
    // Cs1: {
    //     caption: "Show Refs using cs1 template",
    //     desc: "what is condition?",
    //     filter: () => (d) => 0,
    // },
    ISBN: {
        /*
        ISBN references I would define as: references with a template name "isbn" aka
        naked isbn or references with a cite book + parameter isbn that is not none.
         */
        caption: "Show Refs with ISBN",
        desc: "d.template_names.includes ['cite book','isbn']",
        filter: () => (d) => {
            return d.template_names.includes("cite book") || d.template_names.includes("isbn");
        },
    },

    // TODO: this algorithm is not returning the number of refs as given in agg[without_a_template]
    NoTemplate: {
        caption: "Refs without a Template",
        desc: "d.template_names.length < 1",
        // filter: () => true,
        filter: () => (d) => d.template_names.length < 1,
    },

    booksArchive: {
        /*
        ISBN or book refs with
         */
        caption: "Show Refs with ISBN",
        desc: "d.template_names.includes ['cite book','isbn']",
        filter: () => (d) => {
            return d.template_names.includes("cite book") || d.template_names.includes("isbn");
        },
    },

};

const REF_FILTER_NAMES = Object.keys(REF_FILTER_MAP);



// display filter buttons
const ReferenceFilters = ( {filterList, filterCaption}) => {
    return <div>
        <h4>Reference Filters<br/><span style={{fontSize:"smaller", fontWeight:"normal"}}>Current filter: {filterCaption}</span></h4>
        <div className={"reference-filters"}>
            {filterList}
        </div>
    </div>

}

// display url info
const RefOverview = ( { overview, onClickLink } ) => {

    return <div>
        <h4>Reference Types</h4>
        { !overview ? <p>Missing reference overview data.</p>
        : <div>
            <div className={"reference-types"}>
                {Object.keys(overview).map((key, i) => {
                        return <p key={i}><span>{key} : {overview[key]}</span></p>
                    }
                )}
            </div>
        </div>}

    </div>
}

/*
    displays url overview info

    assumed structure of overview:

    { urlCounts : [
        {label:, count:, link: },
        ...
      ]
    }
*/
const UrlOverview = ( { overview, onClickChart } ) => {

    if (!overview) { return <div>
            <h4>Urls</h4>
            <p>No Url statistics to show.</p>
        </div>}

    const overviewWithoutAll = overview.urlCounts
        ? overview.urlCounts.filter(s => s.link !== "all")
        : [];

    const onClickLegend = (event, legendItem, legend) => {
        const index = legendItem.index;
        const ci = legend.chart;
        const link = ci.data.datasets[0].links[index];
        // console.log(`legend index: ${index}, link: ${link}`);

        // pass link up to passed in click routine
        onClickChart(link)
    }

    const chartData = {

        labels: overviewWithoutAll.map( d => d.label),
        datasets: [{
            label: "URLs",
            data: overviewWithoutAll.map( d => d.count),
            links: overviewWithoutAll.map( d => d.link),
            backgroundColor: [ colors.teal, colors.yellow, colors.red, colors.magenta, colors.grey, ]
        }],

        borderColor: "black",
        borderWidth: 2,
    }

    const options = {
        cutout: "50%",
        responsive: true,
        plugins: {
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
                        size: 14
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

    // // debug display for chartData
    // return <div>
    //     <h4>Urls</h4>
    //     <RawJson obj={chartData} />
    // </div>

    const onClick = (link) => {
        // console.log("pie chart clicked, link=", link)
        onClickChart(link);
    }

    const total = overview.urlCounts && overview.urlCounts
        ? overview.urlCounts.filter(s => s.link === "all")[0].count
        : ""

    return <div>
        <h4>URLs - {total} total</h4>
        <div className={"url-chart-display"}>
            {/*<pre className={"raw-json"}>{JSON.stringify(overview, null, 2)}</pre>*/}
            <PieChart chartData={chartData} options={options} onClick={onClick}/>
        </div>
    </div>

}

// // display filter buttons
// const UrlFilters = ( {filterList, filterCaption}) => {
//     return !filterList || !filterList.length ? null : <div>
//         {/*<h4>URL Filters<br/><span style={{fontSize:"smaller", fontWeight:"normal"}}>Current filter: {filterCaption}</span></h4>*/}
//         {/*<h4>URL Filters</h4>*/}
//         <h4>{'\u00A0'}</h4>
//         <div className={"url-filters"}>
//             {/*{filterList}*/}
//         </div>
//     </div>
//
// }

export default function PageOverview( { refOverview,
                                          urlOverview,
                                          setRefFilter,
                                          setUrlFilter,
                                          options
                                        })
{
    const [refFilterName, setRefFilterName] = useState( null );
    const [urlFilterName, setUrlFilterName] = useState( null );

    function handleRefButton(name) {
        setRefFilterName(name);
        const f = REF_FILTER_MAP[name];
        setRefFilter(f ? f.filter : null)
    }

    const refFilterList = REF_FILTER_NAMES.map((name) => {
        let f = REF_FILTER_MAP[name];
        return <FilterButton key={name}
                             name={name}
                             caption={f.caption}
                             desc={f.desc}
                             isPressed={name===refFilterName}
                             onClick = {handleRefButton}
                             useDesc = {false}
        />
    });

    const handleUrlButton= (name) => {
        // if new name === current name, toggle between "all" and new name
        const newName = urlFilterName === name ? "all" : name;
        setUrlFilterName(newName); // calls "UP" to the enclosing component
        const f = URL_FILTER_MAP[newName];
        setUrlFilter(f)
    }

    // const urlFilterList = ["all"].map((name) => { // just show the All for now...
    //     const f = URL_FILTER_MAP[name];
    //     // we have urlOverview; we want to extract count for filter matching name.
    //     // if urlOverview.urlCounts is bad, we skip the counts
    //     const count = urlOverview && urlOverview.urlCounts
    //         ? " (" + urlOverview.urlCounts.filter( s => s.link === name)[0].count + ")"
    //         : "";
    //
    //     return <FilterButton key={name}
    //                          name={name}
    //                          caption={f.caption + count}
    //                          desc={f.desc}
    //                          isPressed={name===urlFilterName}
    //                          onClick = {handleUrlButton}
    //     />
    // });

    // console.log("urlOverview:", urlOverview);

    return <div className={"page-overview"}>
        <h3>Page Overview</h3>
        <div className={"page-overview-wrap"}>

            <UrlOverview overview={urlOverview} onClickChart={handleUrlButton}/>
            {/*<Urls urlArray={urlBigArray} filter={myUrlFilter}/>*/}

            {/*<UrlFilters filterList={urlFilterList} filterCaption={URL_FILTER_MAP[urlFilterName] ? URL_FILTER_MAP[urlFilterName].caption : ""} />*/}

            <ReferenceFilters filterList={refFilterList}
                              filterCaption={REF_FILTER_MAP[refFilterName] ? REF_FILTER_MAP[refFilterName].caption : ""} />

            <RefOverview overview={refOverview} onClickLink={()=>{}} />

        </div>
    </div>
}