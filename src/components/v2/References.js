// import React, {useEffect, useState} from 'react';
import React, { useState } from 'react';
import RefDetails from './RefDetails.js';
// import { API_V2_URL_BASE } from '../../constants/endpoints.js';

//
// function getLinkText(d) {
//
//     return [
//         (( d.flds && d.flds.length )
//         ? d.flds.map((fld, j) => <p>{fld}</p>) // all flds
//         : [d.wikitext] ),
//
//         null ];
//     // "Arf!"];
// }
//
// function getRefClassName(d) {
//     return (d.plain_text_in_reference ? "ref-plain-text" : "") +
//     (d.is_named_reference ? "ref-named" : "")
//     ;
// }

function getLinkText(ref) {

    let text = "";

    if(ref.template_names)
    {
        ref.template_names.map((tn, i) => {
            // <span style={{fontWeight: "bold"}}>{tn}</span>
            text += tn + "\n";
            return null;
        })
    }

    if (ref.titles) {
        ref.titles.map((t,i) => {
            text += t + "\n";
            return null;
        })
    }

    if (!text) text += "ref id: " + ref.id;

    //text = <span style={{fontWeight : "bold"}}>cite web</span>
    return <p>{text}</p>

    // return [
    //     (( d.flds && d.flds.length )
    //     ? d.flds.map((fld, j) => <p>{fld}</p>) // all flds
    //     : [d.wikitext] ),
    //
    //     null ];
}

function References( { refs, filter } ) {

    const [refDetails, setRefDetails] = useState(null);
    // const [isLoading, setIsLoading] = useState(false);


    const fetchDetail = (ref) => {
        // handle null pageData
        if (!ref) {
            setRefDetails("Trying to fetch invalid reference");
            return;
        }

        const API_V2_URL_BASE = 'https://archive.org/services/context/wari/v2';
        const endpoint = `${API_V2_URL_BASE}/statistics/reference/${ref.id}`;

        // fetch the data
        fetch(endpoint, {
        })

            .then((res) => {
                if(!res.ok) throw new Error(res.status);
                return res.json();
            })

            .then((data) => {
                setRefDetails(data);
            })

            .catch((err) => {
                setRefDetails("Error with details");
            })

            .finally(() => {
                // console.log("fetch finally")
                // setIsLoading(false);
            });

    }


    const filteredRefs = filter ? refs.filter( filter ) : refs;

    return <div className={"references"}>

        <div className={"refs-container"}>
            <h3>References</h3>
            <p style={{marginTop:0}}>all refs.count = {refs.length}
                <br/>filtered refs.count = {filteredRefs.length}</p>
            {!filteredRefs ? <><p>No references!</p></> :
                filteredRefs.map((ref, i) => {
                    return <button key={i}
                                   className={"ref-button"}
                                   onClick={(e) => {
                                       fetchDetail(ref)
                                   }}>{getLinkText(ref)}</button>
                })}

            {
                // <pre>{JSON.stringify(refs, null, 2)}</pre>

                // refs.references.map((obj, i) => <div key={i} >
                //     <pre>{JSON.stringify(obj, null, 2)}</pre>
                // </div>)

            }
        </div>

        <div className={"ref-details"}>
            <h3>Reference Details</h3>
            <RefDetails details={refDetails} />
        </div>

    </div>

}


export default References;