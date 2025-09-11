import React from 'react';
import './archiveDisplay.css';
import '../../shared/components.css';
import {ConfigContext} from "../../../contexts/ConfigContext.jsx";
import BubbleChart from "../../d3/BubbleChart.jsx";

export default function ArchiveDisplay ({ pageData, options } ) {

    let myConfig = React.useContext(ConfigContext);
    myConfig = myConfig ? myConfig : {} // prevents "undefined.<param>" errors

    // pld is "pay level domain"
    if (!pageData?.pld_statistics) return <>
        <div>No domain statistics found in page data.</div>
    </>

    // TODO Figure out what this Archive display does.
    const simpleArchiveArray = Object.keys(pageData.pld_statistics).map( domain => {

        // what do we want here? do we want pageData.urlData?

        return {
            label: domain,
            count: pageData.pld_statistics[domain],
            link: domain,
        }
    }).sort((a, b) => {
        // sort by count...
        return a.count < b.count
            ? 1
            : a.count > b.count
                ? -1
                // ... and then by label alphabetic
                : a.label < b.label
                    ? 1
                    : a.label > b.label
                        ? -1
                        : 0
    })


    // 1. put data into 2-column name, value array:
    const domainsArray = Object.keys(pageData.pld_statistics).map( domain => {
        return {
            name: domain,
            value: pageData.pld_statistics[domain],
        }
    }).sort((a, b) => {
        return a.value < b.value
            ? 1
            : a.value > b.value
                ? -1
                : a.name < b.name
                    ? 1
                    : a.name > b.name
                        ? -1
                        : 0
    })

    // simpleDomainsDisplay is for debug
    const simpleArchiveDisplay = <div className={"archive-display-section"}>
        <div className={"archive-display-section-header"}>Simple Archive display</div>
        <div className={"archive-display-section-header"}>Shows archive status
            of url and all archive urls and if they support a prime url or not</div>
        {/*<div className={"archive-display-section-body"}>*/}
        {/*    {simpleArchiveArray.map(archive => {*/}
        {/*        return <div key={archive.label}>link: {archive.label}, count: {archive.count}</div>*/}
        {/*    })}*/}
        {/*</div>*/}
    </div>


    return <>
        <div className={"domain-display section-box"}>

            <h3>Archives <span style={{
                fontSize: '50%', 
                fontStyle: "italic", 
                color: "red"}}>This feature under development</span></h3>

            {simpleArchiveDisplay}

            {/*<BubbleChart data={domainsArray} width={"400"} height={"400"} />*/}

        </div>

    </>
}
