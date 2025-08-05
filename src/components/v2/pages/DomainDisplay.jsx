import React, { useState } from 'react';
import './domains.css';
import '../../shared/components.css';

export default function DomainDisplay ({ pageData, options } ) {

    // const [refFilter, setRefFilter] = useState( null ); // filter to pass in to RefFlock
    // const [selectedFilter, setSelectedFilter] = useState( [] ); // to hilite selected filter button

    if (!pageData?.pld_statistics) return <>
        <div>No domain statistics found in page data.</div>
    </>

    const domainsArray = Object.keys(pageData.pld_statistics).map( domain => {
        return {
            label: domain,
            count: pageData.pld_statistics[domain],
            link: domain,
        }
    }).sort((a, b) => {
        return a.count < b.count
            ? 1
            : a.count > b.count
                ? -1
                : a.label < b.label
                    ? 1
                    : a.label > b.label
                        ? -1
                        : 0
    })


    return <>
        <div className={"domain-display section-box"}>

            {true && <h3>Domains <span style={{fontSize: '50%', fontStyle: "italic", color: "red"}}>This feature under development</span></h3>}

            <div className={"domain-display-section"}>
                <div className={"domain-display-section-header"}></div>
                <div className={"domain-display-section-body"}>
                    {domainsArray.map(domain => {
                        return <div key={domain.label}>domain: {domain.label}, count: {domain.count}</div>
                    })}
                </div>
            </div>
        </div>

    </>
}
