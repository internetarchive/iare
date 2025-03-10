import React from "react";
import MapDisplay from '../MapDisplay.js';
import TR from '../TR.js';
import ReferencesV1 from './ReferencesV1.js';

/*
    expected props:
        urls
 */
function ShowUrls( { urls } ) {

    if (!urls) return "no urls to display";

    return <table className={"tight"}>
        <tbody>
        <TR label="count" value={urls.agg.all} />
        <TR label="unique" value={<MapDisplay map = {urls.agg.unique} />} />
        </tbody>
    </table>

}


function ShowTypes(props) {
    const myTypes = props.types;

    if (!myTypes) return "no types to display";

    // special handle cs1_t and citeq_t properties
    let {cs1_t, citeq_t, ...aggInfo} = myTypes.content.agg;
    aggInfo["citeq_t"] = citeq_t.all;

    return <>
        <table className={"tight"}>
            <tbody>
            <TR label="all" value={myTypes.content.all} />
            <TR label="citation" value={myTypes.content.citation.all} />
            <TR label="general" value={myTypes.content.general.all} />
            <TR label="named" value={myTypes.named} />
            <tr>
                <td>{"agg"}</td>
                <td>
                    {<MapDisplay map = {aggInfo} />}
                    <p style={{margin: '2px 0 2px 5px'}}>cs1_t</p>
                    <table style={{marginLeft: '26px'}}>
                        <tbody>
                        <TR label="all" value={cs1_t.all} />
                        <TR label="web" value={<MapDisplay map = {cs1_t.web} />} />
                        <TR label="journal" value={<MapDisplay map = {cs1_t.journal} />} />
                        <TR label="book" value={<MapDisplay map = {cs1_t.book} />} />
                        <TR label="others" value={cs1_t.others} />
                        </tbody>
                    </table>

                </td>
            </tr>
            </tbody>
        </table>

    </>
}

/*
    expected props:
        domains     array of { <domain> : <count> } objects
 */
function DomainCounts( { domains }) {

    if (!domains) return <p>{"no domains to display"}</p>;

    return <table>
        <tbody>
        {domains.map((domain) => {
                let dName = Object.keys(domain)[0];
                return <TR label = { dName } value ={domain[dName]}  key={dName}/>
            }
        )}
        </tbody>
    </table>

}



function RefDataV1( { pageData }) {

    const refData = pageData ? pageData.references : null ;

    return  (!refData
            ? <div className="j-view-refs"><h3>No Reference Data to show</h3></div>
    : (<div className="j-view-refs">
            <div>
                <h3>Aggregate References Data</h3>

                <table>
                    <tbody>
                    <TR label="all" value={refData.all}/>
                    <TR label="urls" value={<ShowUrls urls={refData.urls}/>} tight={true}/>
                    <TR label="types" value={<ShowTypes types={refData.types}/>} tight={true}/>
                    </tbody>
                </table>
            </div>

            <div>
                <h3>First Level Domain Counts</h3>
                <DomainCounts domains={refData.first_level_domain_counts}/>
            </div>

            <ReferencesV1 details={refData.details}/>

            {/*<pre>{JSON.stringify(rd, null, 2)}</pre>*/}

        </div>)
    )


}

export default RefDataV1;
