import React from 'react';
import './archiveDisplay.css';
import '../../css/components.css';
import {ConfigContext} from "../../../contexts/ConfigContext.jsx";
// import BubbleChart from "../../d3/BubbleChart.jsx";
import { compareByUrl } from '../../../constants/sortMethods.jsx';

export default function ArchiveDisplay ({ pageData, options } ) {

    let myConfig = React.useContext(ConfigContext);
    myConfig = myConfig ? myConfig : {} // prevents "undefined.<param>" errors

    const simpleUrlDict = Object.keys(pageData.urlDict).map( urlKey => {
        // extract url from key
        return { url: urlKey }
    }).sort(compareByUrl('asc'));

    const simpleUrlArray = pageData.urlArray.map( urlObj => {
        // extract url from url object
        return { url: urlObj.url }
    }).sort(compareByUrl('asc'))


    // simpleDomainsDisplay is for debug
    const simpleArchiveDisplay = <div className={"archive-display-section"}>
        <div className={"archive-display-section-header"}>Simple Archive display</div>
        <div className={"archive-display-section-header"}>Shows archive status
            of url and all archive urls and if they support a prime url or not</div>

        <div className={"archive-display-columns"}>
            <div className={"archive-display-section"}>
                <div className={"archive-display-section-header"}>Simple Url Dict <span>count: {simpleUrlDict.length}</span></div>

                {simpleUrlDict.map( urlObj => {
                    return <div key={urlObj.url} className={"url-display-header"}>link: {urlObj.url}</div>
                })}
            </div>

            <div className={"archive-display-section"}>
                <div className={"archive-display-section-header"}>Simple Url Array <span>count: {simpleUrlArray.length}</span></div>

                {simpleUrlArray.map( urlObj => {
                    return <div key={urlObj.url} className={"url-display-header"}>link: {urlObj.url}</div>
                })}
            </div>
        </div>

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
