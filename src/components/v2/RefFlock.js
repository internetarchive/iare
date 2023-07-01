import React, {useEffect, useState} from 'react';
import { IARI_V2_URL_BASE } from '../../constants/endpoints.js';
import RefView from "./RefView/RefView";

function getLinkText(ref) {

    return <>
        {ref.reference_count && ref.reference_count > 1 ?
            <span className={'ref-line multi-ref'}>reference count: {ref.reference_count}</span> : null}
        {ref.name ? <span className={'ref-line'}>Reference Name: <span style={{fontWeight: "bold"}}>{ref.name}</span></span> : null }
        {ref.template_names && ref.template_names.length
            ? ref.template_names.map( tn => {
                return <span className={'ref-line'}>Template: <span style={{fontWeight: "bold"}}>{tn}</span></span>
            }) : null}
        {ref.titles
            ? ref.titles.map( t => {
                return <span className={'ref-line'} style={{fontWeight: "bold"}}>{t}</span>
            }) : null }
        <span className={'ref-line'}>ref id: {ref.id}</span>
    </>

}

function RefFlock({ refArray, refFilterDef, onAction } ) {

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
        const myEndpoint = `${IARI_V2_URL_BASE}/statistics/reference/${ref.id}`;

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

    const handleRemoveFilter = (e) => {

        // send action back up the component tree
        onAction( {
            "action": "removeReferenceFilter",
            "value": '',
        })
        // do we need to do anything local?
    }

    let refs, caption;

    if (!refArray) {
        caption = <h4>No references!</h4>
        refs = null

    } else {
        // filter the refs if filter defined
        const filteredRefs = refFilterDef
            ? refArray.filter((refFilterDef.filterFunction)()) // Note self-calling function
            : refArray;

        const buttonRemove = refFilterDef
            ? <button onClick={handleRemoveFilter}
                 className={'utility-button'}
                 style={{position: "relative", top: "-0.1rem"}}
                ><span>Remove Filter</span></button>
            : null

        caption = <>
            <h4>Applied Filter: {refFilterDef ? refFilterDef.caption : 'Show All'}</h4>
            <h4>{filteredRefs.length} {filteredRefs.length === 1
                ? 'Reference' : 'References'}{buttonRemove}</h4>
        </>

        refs = <>
            <div className={"ref-list"}>
                {filteredRefs.map((ref, i) => {
                    return <button key={i}
                       className={"ref-button"}
                       onClick={(e) => {
                           fetchDetail(ref)
                       }}>{getLinkText(ref)}</button>
                })}
            </div>
        </>
    }

    return <div className={"ref-flock"}>

        <div className={"ref-list-wrapper"}>
            {caption}
            {refs}
        </div>

        <RefView details={refDetails} open={openModal} onClose={() => setOpenModal(false)} />

    </div>
}

export default RefFlock;