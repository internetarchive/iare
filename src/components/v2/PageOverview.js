import React, {useState} from "react";
import FilterButton from "../FilterButton";


const REF_FILTER_MAP = {
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
            return d.template_names.includes("cite web");
        },
    },
    CiteMap: {
        caption: "Cite Map",
        desc: "template_names[] contains 'cite map'",
        filter: () => (d) => {
            return d.template_names.includes("cite map");
        },
    },
    // Cs1: {
    //     caption: "Show Refs using cs1 template",
    //     desc: "what is condition?",
    //     filter: () => (d) => 0,
    // },
    ISBN: {
        /*
        ISBN references I would define as: references with a template name "isbn" aka
        naked isbn or references with a cite book + parameter isbn that is not none.
         */
        caption: "Show Refs with ISBN",
        desc: "d.template_names.includes ['cite book','isbn']",
        filter: () => (d) => {
            return d.template_names.includes("cite book") || d.template_names.includes("isbn");
        },
    },

    // TODO: this algorithm is not returning the number of refs as given in agg[without_a_template]
    NoTemplate: {
        caption: "Refs without a Template",
        desc: "d.template_names.length < 1",
        // filter: () => true,
        filter: () => (d) => d.template_names.length < 1,
    },

};

const REF_FILTER_NAMES = Object.keys(REF_FILTER_MAP);



const URL_FILTER_MAP = {
    All: {
        caption: "Show All Urls",
        desc: "no filter",
        filter: () => () => {return true},
    },
    Status2XX: {
        caption: "Status 2XX",
        desc: "'",
        filter: () => (d) => {
            return [200,201,202,203,204,205,206,207,208,226].includes(d.data.status_code);
        },
    },
    Status3XX: {
        caption: "Status 3XX",
        desc: "'",
        filter: () => (d) => {
            return [300,301,302,303,304,305,306,307,308].includes(d.data.status_code);
        },
    },
    Status4XX: {
        caption: "Status 4XX",
        desc: "'",
        filter: () => (d) => {
            return d.data.status_code >= 400 && d.data.status_code < 500;
        },
    },
    Status5XX: {
        caption: "Status 5XX",
        desc: "'",
        filter: () => (d) => {
            return d.data.status_code >= 500 && d.data.status_code < 600;
        },
    },
    Unknown: {
        caption: "Unknown",
        desc: "'",
        filter: () => (d) => {
            return !d.data.status_code;
        },
    },

};

const URL_FILTER_NAMES = Object.keys(URL_FILTER_MAP);

// display filter buttons
const ReferenceFilters = ( {filterList, filterCaption}) => {
    return <div>
        <h4>Reference Filters<br/><span style={{fontSize:"smaller", fontWeight:"normal"}}>Current filter: {filterCaption}</span></h4>
        <div className={"reference-filters"}>
            {filterList}
        </div>
    </div>

}

// display filter buttons
const UrlFilters = ( {filterList, filterCaption}) => {
    return <div>
        <h4>URL Filters<br/><span style={{fontSize:"smaller", fontWeight:"normal"}}>Current filter: {filterCaption}</span></h4>
        <div className={"url-filters"}>
            {filterList}
        </div>
    </div>

}

// display url info
const UrlDisplay = ( { urls } ) => {

    return <div>
        <h4>Urls</h4>
        <div className={"url-display"}>
            <p>Will show status code breakdown here</p>
        </div>
    </div>

}

/*
    props
        pageData
        setRefFilter   callback to set filter when filter button pressed
 */
export default function PageOverview({pageData, setRefFilter, setUrlFilter}) {

    const [refFilterName, setRefFilterName] = useState( null );
    const [urlFilterName, setUrlFilterName] = useState( null );

    // const nullCall = () => { alert("placeholder call for filter"); }

    function handleRefButton(name) {
        setRefFilterName(name);
        const f = REF_FILTER_MAP[name];
        setRefFilter(f ? f.filter : null)
    }

    const refFilterList = REF_FILTER_NAMES.map((name) => {
        let f = REF_FILTER_MAP[name];
        return <FilterButton key={name}
                             name={name}
                             caption={f.caption}
                             desc={f.desc}
                             isPressed={name===refFilterName}
                             onClick = {handleRefButton}
        />
    });

    function handleUrlButton(name) {
        setUrlFilterName(name);
        const f = URL_FILTER_MAP[name];
        setUrlFilter(f ? f.filter : null)
    }

    const urlFilterList = URL_FILTER_NAMES.map((name) => {
        let f = URL_FILTER_MAP[name];
        return <FilterButton key={name}
                             name={name}
                             caption={f.caption}
                             desc={f.desc}
                             isPressed={name===urlFilterName}
                             onClick = {handleUrlButton}
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

                <ReferenceFilters filterList={refFilterList} filterCaption={REF_FILTER_MAP[refFilterName] ? REF_FILTER_MAP[refFilterName].caption : ""} />

                <UrlDisplay urls={pageData.urls}/>

                <UrlFilters filterList={urlFilterList} filterCaption={URL_FILTER_MAP[urlFilterName] ? URL_FILTER_MAP[urlFilterName].caption : ""} />


            </div> }
    </div>
}