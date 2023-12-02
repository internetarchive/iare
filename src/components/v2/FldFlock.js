import React from 'react';

export default function FldFlock({ fldArray, onAction, selectedDomain = '' }) {

    const onClick = (evt) => {
        const domain = evt.target.parentNode.dataset["domain"];
        // send action back up the component tree
        onAction( {
            "action": "setDomainFilter",
            "value": domain,
        })
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

    const columnLabels = {
        domain: 'Domain',
        count: 'cnt',
    }

    const flds = (!fldArray || !fldArray.length)
        ? <p>No Domains to show!</p>
        : <div className={'fld-list-wrapper'}>

            <h4 className={"list-instruction"}>Click to filter References List by Domain</h4>

            <div className={"fld-list-header"} onClick={onClickHeader} onMouseOver={onHoverHeader} >
                <div className={"fld-row"} >
                    <div>{columnLabels.domain}</div>
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