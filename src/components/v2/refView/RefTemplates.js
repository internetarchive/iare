import React from "react";
import RefTemplate from "./RefTemplate";

/*
shows tabs of template params if there; 1 tab for each template
 */
export default function RefTemplates({ templates, pageData, tooltipId }) {

    // const [key, setKey] = useState('template_1');
    //
    // const getTabContent = (templates) => {
    //     if (!templates || !templates.length) {
    //         return <Tab title={"No Templates"} disabled={true} >
    //             <p>No Templates to show</p>
    //         </Tab>
    //     }
    //
    //     let n = 0;
    //     // loop thru each template set
    //     return templates.map(t => {
    //         n++;
    //         const tabID = `template_${n}`;
    //         const name = t.parameters && t.parameters.template_name ? t.parameters.template_name : `Template ${n}`;
    //
    //         return <Tab eventKey={tabID} key={tabID} title={name}>
    //             <div className={'parameters'}>
    //                 <Parameters parameters={t.parameters} />
    //             </div>
    //         </Tab>
    //     })
    // }

    return <div className="ref-view-section ref-view-templates">

        {/*<h3 className={"template-header"}>Templates</h3>*/}
        {templates ?
            templates.map((t,i) => {
                return <RefTemplate template={t} pageData={pageData} tooltipId={tooltipId} key={i}/>
            })
            : <>
                <h3 className={"template-header"}>Template:</h3>
                <div>No templates found.</div>
            </>
        }
    </div>
}
