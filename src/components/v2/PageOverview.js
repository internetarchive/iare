import React from "react";
import FilterButton from "../FilterButton";


const FILTER_MAP = {
    All: {
        caption: "Show All Refs",
        desc: "no filter",
        filter: () => true,
    },
    // Plain: {
    //     caption: "Show Refs with Plain Text",
    //     desc: "plain_text_in_reference = true",
    //     filter: (d) => d.plain_text_in_reference,
    // },
    NamedTemplate: {
        caption: "Named Templates",
        desc: 'template_names[]',
        filter: (d) => d.template_names.length > 0,
    },
    CiteWeb: {
        caption: "Cite Web",
        desc: "template_names[] contains 'cite web'",
        filter: (d) => {
            // d.template_names.map((t,i) => {
            //     // if (t === "cite map") return true;
            // })
            // return 0;
            return 0;
        },
    },
    Cs1: {
        caption: "Show Refs using cs1 template",
        desc: "what is condition?",
        filter: (d) => 0,
    },
    ISBN: {
        caption: "Show Refs with ISBN",
        desc: "what is condition?",
        filter: (d) => 0,
    },

    // TODO: this algorithm is not returning the number of refs as given in agg[without_a_template]
    NoTemplate: {
        caption: "Refs without a Template",
        desc: "d.template_names.length < 1",
        // filter: () => true,
        filter: (d) => d.template_names.length < 1,
    },

};

const FILTER_NAMES = Object.keys(FILTER_MAP);



/*
    props
        pageData
        setFilter   function to call when filter button pressed
 */
export default function PageOverview({pageData, setFilter}) {


    const nullCall = () => { alert("placeholder call for filter"); }

    const filterList = FILTER_NAMES.map((name) => {
        let f = FILTER_MAP[name];
        return <FilterButton key={name}
                             name={name}
                             caption={f.caption}
                             desc={f.desc}
                            // isPressed={name===refFilter}
                            //  onClick = {setFilter} // need to figure out how to pass back up
                             onClick = {nullCall}
        />
    });

    if (!pageData) return <div className={"page-overview"}>
        <h3>Page Overview</h3>
        <p>No page data to display</p>;
    </div>;

    return <div className={"page-overview"}>
        <h3>Page Overview</h3>

        { !pageData.reference_statistics ? <p>Missing reference_statistics</p>
        : <div className={"page-overview-wrap"}>

            <div>
                <h4>Reference Types</h4>
                <div className={"reference-types"}>
                    {Object.keys(pageData.reference_statistics).map((key, i) => {
                        return <p><span>{key} : {pageData.reference_statistics[key]}</span></p>
                    }
                    )}
                </div>
            </div>

            <div>
                <h4>Filters for References</h4>
                <div className={"reference-filters"}>
                    {filterList}
                </div>
            </div>


        </div> }
    </div>
}