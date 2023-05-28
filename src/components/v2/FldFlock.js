import React, { useState } from 'react';

export default function FldFlock({ fldArray, onAction }) {

    const [selectedDomain, setSelectedDomain] = useState('' ); // selected domain in list

    const onClick = (evt) => {
        const domain = evt.target.parentNode.dataset["domain"];
        onAction( {
            "action": "setDomainFilter",
            "value": domain,
        })
        setSelectedDomain(domain)
    }

    const onClickHeader = (evt) => {
    }

    const onHover = (evt) => {
        // console.log("FldFlock: onHover")
    }

    const onHoverHeader = (evt) => {
        // console.log("FldFlock: onHoverHeader")
        // toggle show of Show All button
    }

    const onClickShowAll = (evt) => {
        console.log("FldFlock: onClickShowAll")
        onAction( {
            "action": "setDomainFilter",
            "value": null,
        })
        setSelectedDomain(null)
    }

    const columnLabels = {
        domain: 'Domain',
        count: 'cnt',
    }

    const flds = (!fldArray || !fldArray.length)
        ? <p>No Domains to show!</p>
        : <div className={'field-list-wrapper'}>

            <h4>Click to filter by domain</h4>

            <div className={"fld-list-header"} onClick={onClickHeader} onMouseOver={onHoverHeader} >
                <div className={"fld-row"} >
                    <div>{columnLabels.domain}
                        <button
                            className={'display-button-showall'}
                            onClick={onClickShowAll}>
                            <span>Show All</span>
                        </button>
                    </div>
                    <div>{columnLabels.count}</div>
                </div>
            </div>

            <div className={"fld-list"} onClick={onClick} onMouseOver={onHover} >
                {fldArray.map((fld, i) => {
                    return <div className={`fld-row ${fld.domain === selectedDomain ? 'fld-selected' : null}`}
                             key={fld.domain}
                             data-domain={fld.domain}
                             data-count={fld.count}
                             >
                        <div>{fld.domain}</div>
                        <div>{fld.count}</div>
                    </div>
                })}

            </div>
        </div>

    return <div className={"fld-flock"}>
        {flds}
    </div>
}