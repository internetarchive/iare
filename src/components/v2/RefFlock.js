import React, {useEffect, useState} from 'react';
import { API_V2_URL_BASE } from '../../constants/endpoints.js';
import RefView from "./RefView/RefView";

function getLinkText(ref) {

    let text = "";

    if (ref.template_names && ref.template_names.length > 0) {
        ref.template_names.map((tn, i) => {
            // <span style={{fontWeight: "bold"}}>{tn}</span>
            text += tn + "\n";
            return null;
        })
    } else {
        // wikitext does not come with dehydrated_refrences
        // text += ref.wikitext + "\n";
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

function RefFlock({ refArray, refFilterDef } ) {

    const [refDetails, setRefDetails] = useState(null);
    // const [isLoading, setIsLoading] = useState(false);

    const [openModal, setOpenModal] = useState(false)
    const fetchDetail = (ref) => {
        // handle null ref
        if (!ref) {
            setRefDetails("Trying to fetch invalid reference");
            return;
        }

        // TODO: use refresh here ?
        const myEndpoint = `${API_V2_URL_BASE}/statistics/reference/${ref.id}`;

        // fetch the data
        fetch(myEndpoint, {
        })

            .then((res) => {
                if(!res.ok) throw new Error(res.status);
                return res.json();
            })

            .then((data) => {
                data.endpoint = myEndpoint;
                setRefDetails(data);
            })

            .catch((err) => {
                setRefDetails(`Error with details (${err})`);
            })

            .finally(() => {
                // console.log("fetch finally")
            });

    }

    useEffect( () => {
        // alert("will show new refDetails")
        setOpenModal(true)
    }, [refDetails])

    let refs;

    if (!refArray) {
        refs = <h4>No references!</h4>

    } else {
        // filter the refs if filter defined
        const filteredRefs = refFilterDef
            ? refArray.filter((refFilterDef.filterFunction)())
            : refArray;

        const refList = filteredRefs.map((ref, i) => {
            return <button key={i}
                           className={"ref-button"}
                           onClick={(e) => {
                               fetchDetail(ref)
                           }}>{getLinkText(ref)}</button>
        });

        const label = refFilterDef
            ? `${filteredRefs.length} Filtered Refs : ${refFilterDef.caption}`
            : `${filteredRefs.length} Refs (no filter)`
        refs = <>
            <h4>{label}</h4>
            <div className={"ref-list"}>
                {refList}
            </div>
        </>
    }

    return <div className={"ref-flock"}>

        <div className={"ref-list-wrapper"}>
            {refs}
        </div>

        <RefView open={openModal} onClose={() => setOpenModal(false)} details={refDetails} />

    </div>
}

export default RefFlock;