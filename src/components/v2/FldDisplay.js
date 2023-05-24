import React, {useState} from 'react';
import './flds.css';
import RefFlock from "./RefFlock";
import FldFlock from "./FldFlock";

export default function FldDisplay({ pageData } ) {

    const [refFilter, setRefFilter] = useState( null ); // filter to pass in to RefFlock

    const getDomainFilter = (targetDomain) => {
        return {
            caption: `Contains ${targetDomain} domain`,
            desc: `Citations with domain: ${targetDomain}`,
            filterFunction: () => (d) => {
                return d.flds.includes( targetDomain )
            },
        }
    }


    const handleAction = (result) => {
        console.log (`FldDisplay::handleAction: `, result);

        const {action, value} = result; // context is ignored

        if (action === "setDomainFilter") {
            // value is domain to search
            setRefFilter(getDomainFilter(value));
        }
    }


    const refArray = (!pageData || !pageData.dehydrated_references)
        ? []
        : pageData.dehydrated_references

    // convert fld objects into fld array of { fld: xxx, count: y }
    const flds = (pageData && pageData.fld_counts)
        ? pageData.fld_counts
        : {};

    const fldArray = Object.keys(flds).map( fld => {
        return {
            domain: fld,
            count: flds[fld]
        }
    })

    return <>
        <div className={"fld-display section-box"}>
            <h3>Domains</h3>
            <FldFlock fldArray={fldArray} onAction={handleAction} />
        </div>

        <div className={"section-box"}>
            <h3>References</h3>
            <RefFlock refArray={refArray} refFilterDef={refFilter} />
        </div>
    </>
}
