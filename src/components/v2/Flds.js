import React from 'react';
import TR from "../TR";

export default function Flds( { flds } ) {

    return <>
        <div className={"flds"}>
            <h3>First Level Domains</h3>

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
