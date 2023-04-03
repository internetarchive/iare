import React, { useState } from 'react';
import RefDetails from './RefDetails.js';
import { API_V2_URL_BASE } from '../../constants/endpoints.js';

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

    return <p>{text}</p>
}

function References( { refs, filter } ) {

    const [refDetails, setRefDetails] = useState(null);
    // const [isLoading, setIsLoading] = useState(false);
    const [referenceEndpoint, setReferenceEndpoint] = useState( "" );

    const fetchDetail = (ref) => {
        // handle null pageData
        if (!ref) {
            setRefDetails("Trying to fetch invalid reference");
            return;
        }

        const endpoint = `${API_V2_URL_BASE}/statistics/reference/${ref.id}`;
        setReferenceEndpoint(endpoint)

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

            {!filteredRefs ? <><p>No references!</p></>
                : <><p style={{marginTop:0}}>all refs.count = {refs.length}
                    <br/>filtered refs.count = {filteredRefs.length}</p>
                {
                filteredRefs.map((ref, i) => {
                    return <button key={i}
                                   className={"ref-button"}
                                   onClick={(e) => {
                                       fetchDetail(ref)
                                   }}>{getLinkText(ref)}</button>
                })}
                </>}
        </div>

        <div className={"ref-details"}>
            <h3>Reference Details</h3>
            <p>source: <a href={referenceEndpoint} target={"_blank"} rel={"noreferrer"}>{referenceEndpoint}</a></p>
            <RefDetails details={refDetails} />
        </div>

    </div>

}


export default References;