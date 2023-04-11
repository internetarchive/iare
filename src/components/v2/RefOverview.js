import React from 'react';
import FilterButtons from "../FilterButtons";
// import BarChart from "../PieChart";
// import RawJson from "../RawJson";
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

// const colors = { // TODO: put this in useContext?
//     blue   : "#35a2eb",
//     red    : "#ff6384",
//     teal   : "#4bc0c0",
//     orange : "#ff9f40",
//     purple : "#9866ff",
//     yellow : "#ffcd57",
//     grey   : "#c9cbcf",
//     magenta: "#f763ff",
// }


// summary is assumed to have a filterSets property, an array of filterDef sets:
//    filterSets : [ <filterSet1>, <filterSet2>, etc...]
export default function RefOverview ({ refArray, summary, onAction, curFilterName } ) {

    const handleClick = (link, context) => {
        // console.log (`RefOverview::handleClick: link: ${link}, context: ${context}`);
        onAction({
            action:"setFilter",
            value: link,
            context: context
            })
        }

    let overview;

    if (!summary) {
        overview = <p>No reference summary information to show.</p>
    } else {
        overview = <>
            {/*<RawJson obj={summary} />*/}

            <FilterButtons
                flock = {refArray}
                filterMap = {summary.filterSets[0]}
                filterList ={[]}
                onClick ={ (e) => {
                    handleClick(e, "set-0")
                }}
                caption = "Reference Types"
                className = "ref-filters"
                currentFilterName = {curFilterName} />

            <FilterButtons
                flock = {refArray}
                filterMap = {summary.filterSets[1]}
                filterList ={[]}
                onClick ={ (e) => {
                    handleClick(e, "set-1")
                }}
                caption = "Reference Filters"
                className = "ref-filters"
                currentFilterName = {curFilterName} />

        </>

        // pull filterDefs from summary
        // create FilterButtons for each set
        // figure out how to scope sets

        // eventually this will be a bar chart, i imagine..., in which case we'll pull
        // summary info from some other field of the summary info

    }

    // function handleRefButton(name) {
    //     setRefFilterName(name);
    //     setRefTypeFilterName("");
    //     const f = REF_FILTER_DEFS[name];
    //     setRefFilter(f ? f.filterFunction : null)
    // }
    //
    // function handleRefTypeButton(name) {
    //     setRefTypeFilterName(name);
    //     setRefFilterName("");
    //     const f = REF_FILTER_TYPES[name];
    //     setRefFilter(f ? f.filterFunction : null)
    // }
    //
    //
    // const myClickFilter = (link) => {
    //     // console.log("pie chart clicked, link=", link)
    //     onAction( {action:"setFilter", value:link})
    // }

    return <div className={"ref-overview"}>
        <div className={"ref-overview-wrap"}>
            {overview}
        </div>
    </div>

}