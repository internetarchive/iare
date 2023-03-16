import React, {useState} from "react";
import FilterButton from "../FilterButton";


const FILTER_MAP = {
    All: {
        caption: "Show All Refs",
        desc: "no filter",
        filter: () => () => {return true},
    },
    // Plain: {
    //     caption: "Show Refs with Plain Text",
    //     desc: "plain_text_in_reference = true",
    //     filter: (d) => d.plain_text_in_reference,
    // },
    NamedTemplate: {
        caption: "Named Templates",
        desc: 'template_names[]',
        filter: () => (d) => {return d.template_names.length > 0},
    },
    CiteWeb: {
        caption: "Cite Web",
        desc: "template_names[] contains 'cite web'",
        filter: () => (d) => {
            // let found = false;
            // d.template_names.map((t,i) => {
            //     if (t === "cite web") found = true;
            // })
            // return found;
            return d.template_names.includes("cite web");
        },
    },
    CiteMap: {
        caption: "Cite Map",
        desc: "template_names[] contains 'cite web'",
        filter: () => (d) => {
            return d.template_names.includes("cite map");
        },
    },
    Cs1: {
        caption: "Show Refs using cs1 template",
        desc: "what is condition?",
        filter: () => (d) => 0,
    },
    ISBN: {
        caption: "Show Refs with ISBN",
        desc: "what is condition?",
        filter: () => (d) => 0,
    },

    // TODO: this algorithm is not returning the number of refs as given in agg[without_a_template]
    NoTemplate: {
        caption: "Refs without a Template",
        desc: "d.template_names.length < 1",
        // filter: () => true,
        filter: () => (d) => d.template_names.length < 1,
    },

};

const FILTER_NAMES = Object.keys(FILTER_MAP);

/*
    props
        pageData
        setRefFilter   callback to set filter when filter button pressed
 */
export default function PageOverview({pageData, setRefFilter}) {

    const [filterName, setFilterName] = useState( null );

    // const nullCall = () => { alert("placeholder call for filter"); }

    function handleRefButton(name) {
        const f = FILTER_MAP[name];
        setFilterName(f.caption);
        setRefFilter(f ? f.filter : null)
    }

    const filterList = FILTER_NAMES.map((name) => {
        let f = FILTER_MAP[name];
        return <FilterButton key={name}
                             name={name}
                             caption={f.caption}
                             desc={f.desc}
                             isPressed={name===filterName}
                             onClick = {handleRefButton}
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
                        return <p key={i}><span>{key} : {pageData.reference_statistics[key]}</span></p>
                    }
                    )}
                </div>
            </div>

            {/* display filter buttons; callbacks to handleRefButton */}
            <div>
                <h4>Filters for References</h4>
                <div className={"reference-filters"}>
                    {filterList}
                </div>
            </div>

            {/* information display */}
            <div>
                <p>Current filter: {filterName}</p>
            </div>


            </div> }
    </div>
}