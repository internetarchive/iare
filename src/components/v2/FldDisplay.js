import React from 'react';
import TR from "../TR";
import './flds.css';

export default function FldDisplay({ flds } ) {

    return <>
        <div className={"fld-display section-box"}>
            <h3>Domains</h3>
            <h4>Click to visit</h4>

            { !flds ? <><p>No flds to show!</p></> :

                // <MapDisplay map={flds} />

                <table className={"tight"}>
                <tbody>
                    {Object.keys(flds).map((fld, i) => {
                        // console.log("Flds: TR: fld = ", fld);
                        return <TR label={<a href={"https://" + fld} target={"_blank"} rel={"noreferrer"}>{fld}</a>} value={flds[fld]} key={fld} />
                    })}
                </tbody>
                </table>

            }

        </div>
    </>
}
