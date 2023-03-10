// import React, {useEffect, useState} from 'react';
import React, { useState } from 'react';
import RefDetails from './RefDetails.js';
import * as Constants from "../../constants/endpoints";
// import FilterButton from "./FilterButton";

// const FILTER_MAP = {
//     All: {
//         caption: "Show All Refs",
//         desc: "no filter",
//         filter: () => true,
//     },
//     Plain: {
//         caption: "Show Refs with Plain Text",
//         desc: "plain_text_in_reference = true",
//         filter: (d) => d.plain_text_in_reference,
//     },
//     Named: {
//         caption: "Show Named Refs",
//         desc: '<ref name="FOO" />',
//         filter: (d) => d.is_named_reference,
//     },
//     Citation: {
//         caption: "Show Citation Refs",
//         desc: "is_citation_reference = true",
//         filter: (d) => d.is_citation_reference,
//     },
//     Cs1: {
//         caption: "Show Refs using cs1 template",
//         desc: "cs1_template_found = true",
//         filter: (d) => d.cs1_template_found,
//     },
//     ISBN: {
//         caption: "Show Refs with ISBN",
//         desc: "isbn_template_found = true",
//         filter: (d) => d.isbn_template_found,
//     },
//
//     // TODO: this algorithm is not returning the number of refs as given in agg[without_a_template]
//     NoTemplate: {
//         caption: "Show Refs without a template",
//         desc: "d.templates.length < 1",
//         // filter: () => true,
//         filter: (d) => d.templates.length < 1,
//     },
//
//
// };
//
// const FILTER_NAMES = Object.keys(FILTER_MAP);
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

function References( { refs, wariID } ) {

    const [details, setDetails] = useState(null);
    // const [isLoading, setIsLoading] = useState(false);


    const fetchDetail = (ref) => {
        // handle null pageData
        if (!ref) {
            setDetails("Trying to fetch invalid reference");
            return;
        }

        const fetchUrl = Constants.URLPART_STATS_REF.replace("{REFID}", ref.id)

        // fetch the data
        fetch(fetchUrl, {
        })

            .then((res) => {
                if(!res.ok) throw new Error(res.status);
                return res.json();
            })

            .then((data) => {
                setDetails(data);
            })

            .catch((err) => {
                setDetails("Error with details");
            })

            .finally(() => {
                // console.log("fetch finally")
                // setIsLoading(false);
            });

    }


    return <div className={"references"}>

        <div className={"refs-container"}>
            <h3>References</h3>
            {!refs ? <><p>No references!</p></> :
                refs.map((ref, i) => {
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
            <RefDetails details={details} />
        </div>

    </div>

}


export default References;