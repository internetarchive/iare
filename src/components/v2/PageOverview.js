import React, {useState} from "react";
import FilterButton from "../FilterButton";
import PieChart from "../PieChart.js";
// import BarChart from "../BarChart.js";

import { URL_FILTER_MAP } from './filters/urlFilterMaps.js';
import { REF_FILTER_MAP, REF_FILTER_NAMES, REF_TYPES_FILTER_MAP } from './filters/refFilterMaps.js';

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
import FilterButtons from "../FilterButtons";
// import {getRelativePosition} from "chart.js/dist/helpers/helpers.dom";

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






export default function PageOverview( { references,
                                          refOverview,
                                          urlOverview,
                                          setRefFilter,
                                          setUrlFilter,
                                        })
{
    const [refFilterName, setRefFilterName] = useState( null );
    const [refTypeFilterName, setRefTypeFilterName] = useState( '' );
    const [urlFilterName, setUrlFilterName] = useState( null );


    const refFilterList = REF_FILTER_NAMES.map((name) => {
        let f = REF_FILTER_MAP[name]; // TODO: catch null f error?
        f.count = references ? references.filter((f.filterFunction)()).length : 0; // Note the self-evaluating filterFunction!
        return <FilterButton key={name}
                             name={name}
                             caption={f.caption}
                             desc={f.desc}
                             count={f.count}
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

    // console.log("urlOverview:", urlOverview);

    return <div className={"page-overview"}>
        <h3>Page Overview</h3>
        <div className={"page-overview-wrap"}>

            <UrlOverview overview={urlOverview} onClickChart={handleUrlButton}/>
            {/*<Urls urlArray={urlBigArray} filter={myUrlFilter}/>*/}

            {/*<UrlFilters filterList={urlFilterList} filterCaption={URL_FILTER_MAP[urlFilterName] ? URL_FILTER_MAP[urlFilterName].caption : ""} />*/}

            <RefOverview references={references} onClick={handleRefTypeButton} curFilterName={refTypeFilterName} />

            <ReferenceFilters filterList={refFilterList}
                              filterCaption={REF_FILTER_MAP[refFilterName] ? REF_FILTER_MAP[refFilterName].caption : ""} />

        </div>
    </div>
}