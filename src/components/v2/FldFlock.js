import React, { useState } from 'react';

export default function FldFlock({ fldArray, onAction }) {

    // const [ selectedFld, setSelectedFld ] = useState[ null ];
    // setSelectedFld(0);
    // console.log(`FldFlock: selected Fld is ${selectedFld} `)
    const [selectedDomain, setSelectedDomain] = useState('' ); // selected domain in list

    const onClick = (evt) => {
        const domain = evt.target.dataset["domain"];
        onAction( {
            "action": "setDomainFilter",
            "value": domain,
        })
        setSelectedDomain(domain)
    }

    const onHover = (evt) => {
        console.log("FldFlock: onHover")
        // get target, and set class to hover?
    }

    const flds = (!fldArray || !fldArray.length)
        ? <p>No Domains to show!</p>
        : <>
            <h4>Click to filter by domain</h4>
            <div className={"fld-list"} onClick={onClick} onMouseOver={onHover} >

                {fldArray.map((fld, i) => {
                    return <div key={fld.domain} data-domain={fld.domain} data-count={fld.count}
                        className={fld.domain === selectedDomain ? 'fld-selected' : null} >{fld.domain}</div>
                })}

            </div>
        </>

    return <div className={"fld-flock"}>
        {flds}
    </div>
}