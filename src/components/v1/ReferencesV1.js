import React, { useState } from 'react';
import RefDetailV1 from './RefDetailV1.js';
import './refsV1.css';
import FilterButton from "../FilterButton";

const FILTER_MAP = {
    All: {
        caption: "Show All Refs",
        desc: "no filter",
        filter: () => true,
    },
    Plain: {
        caption: "Show Refs with Plain Text",
        desc: "plain_text_in_reference = true",
        filter: (d) => d.plain_text_in_reference,
    },
    Named: {
        caption: "Show Named Refs",
        desc: '<ref name="FOO" />',
        filter: (d) => d.is_named_reference,
    },
    Citation: {
        caption: "Show Citation Refs",
        desc: "is_citation_reference = true",
        filter: (d) => d.is_citation_reference,
    },
    Cs1: {
        caption: "Show Refs using cs1 template",
        desc: "cs1_template_found = true",
        filter: (d) => d.cs1_template_found,
    },
    ISBN: {
        caption: "Show Refs with ISBN",
        desc: "isbn_template_found = true",
        filter: (d) => d.isbn_template_found,
    },

    // TODO: this algorithm is not returning the number of refs as given in agg[without_a_template]
    NoTemplate: {
        caption: "Show Refs without a template",
        desc: "d.templates.length < 1",
        // filter: () => true,
        filter: (d) => d.templates.length < 1,
    },


};

const FILTER_NAMES = Object.keys(FILTER_MAP);

function getLinkText(d) {

    return [
        (( d.flds && d.flds.length )
        ? d.flds.map((fld, j) => <p>{fld}</p>) // all flds
        : [d.wikitext] ),

        null ];
    // "Arf!"];
}

function getRefClassName(d) {
    return (d.plain_text_in_reference ? "ref-plain-text" : "") +
    (d.is_named_reference ? "ref-named" : "")
    ;
}

export default function ReferencesV1({ details } ) {

    const [detail, setDetail] = useState({}); // initialize to empty
    const [refFilter, setRefFilter] = useState('All');

    /*
        callback for details buttons
     */
    const showDetail = (d) => {
        setDetail(d)
    }

    const filterList = FILTER_NAMES.map((name) => {
        let f = FILTER_MAP[name];
        return <FilterButton key={name}
            name={name}
            caption={f.caption}
            desc={f.desc}
            isPressed={name===refFilter}
            setFilter = {setRefFilter}
        />
    });

    // calculate filtered set of refs
    const filteredRefs = details.filter( FILTER_MAP[refFilter].filter );

    return <>
        {!filteredRefs
            ? <div className={"ref-details"}>
                <h3>References</h3>
                <p>No references to display</p>
            </div>
            : <>
                <div className={"ref-details"}>
                    <h3>References</h3>

                    <p>total references: {details.length}</p>

                    <div className={"filter-box"}>
                        <h4>Filters</h4>
                        {filterList}
                    </div>

                    <p>filtered references: {filteredRefs.length}</p>
                    <div className={"ref-container"}>
                        <ul>
                            {filteredRefs.map((d, i) => {
                                return <button
                                    key={i}
                                    className = {getRefClassName(d)}
                                    onClick={(e) => {
                                        showDetail(d)
                                    }}>{getLinkText(d)}</button>
                            })}
                        </ul>
                    </div>
                </div>

                <div className={"ref-detail"}>
                    <h3>Detail</h3>
                    {Object.keys(detail).length !== 0
                        ? <RefDetailV1 detail={detail}/>
                        : <p><i>Click a reference to display</i></p>}
                </div>
            </>
        }
    </>
}
