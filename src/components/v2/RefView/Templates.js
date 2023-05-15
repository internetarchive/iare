import React, {useState} from "react";
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';

/*
shows tabs of template params if there; 1 tab for each template
 */
export default function Templates({ templates }) {

    const [key, setKey] = useState('template_1');

    let templatesContent = null;
    if (!templates) {
        templatesContent = <p>No Templates to show</p>
    } else {
        // new helper: ParamDisplay ??

        // create bootstrap tabs
        // for each template
            // display params: label and textbox (later editing)
        // map thru templates
            // map thru parameters

                    // const templateData = templates.map( t => {
                    //     const p = t.parameters;
                    //
                    //     const params = Object.keys(p).map( key => {
                    //         return <div className='row'>
                    //             <div className={"col-3"}>{key}</div>
                    //             <div className={"col-9"}>{p[key]}</div>
                    //         </div>
                    //
                    //     return
                    //     })
                    // })

        const getTemplateTabs = (templates) => {
            let n = 0;
            return templates.map( t => {
                n++;
                const tabID = `template_${n}`;
                const name = t.template_name ? t.template_name : `Template ${n}`;
                // return <button className="nav-link active" type="button" role="tab"
                //                id={`${tabID}-tab`} key={tabID}
                //                data-bs-target={`#${tabID}`} data-bs-toggle="tab"
                //                aria-controls={`${tabID}`} aria-selected={"false"}
                //     // onClick={}
                // >{name}</button>

                return <Tab eventKey={tabID} title={name}>
                    <p>content for template {name}</p>
                </Tab>


            })

        }

        templatesContent = <Tabs
            id="ref-template-tabs"
            activeKey={key}
            onSelect={(k) => setKey(k)}
            className="mb-3"
        >
            {getTemplateTabs(templates)}
        </Tabs>

                        // // get array of tabs, one for each template
                        // let n = 0;
                        // const tabButtons = templates.map( t => {
                        //     n++;
                        //     const tabID = `template_${n}`;
                        //     const name = t.template_name ? t.template_name : `Template ${n}`;
                        //     return <button className="nav-link active" type="button" role="tab"
                        //                    id={`${tabID}-tab`} key={tabID}
                        //                    data-bs-target={`#${tabID}`} data-bs-toggle="tab"
                        //                    aria-controls={`${tabID}`} aria-selected={"false"}
                        //                    // onClick={}
                        //     >{name}</button>
                        // })

                        // n = 0;
                        // const tabContents = templates.map( t => {
                        //     n++;
                        //     const tabID = `template_${n}`;
                        //     return <div className="tab-pane fade show active" id={`${tabID}`} role="tabpanel"
                        //                             aria-labelledby={`${tabID}-tab`}>
                        //         <p>params for tab {tabID}</p>
                        //     </div>

                    // templatesContent = <div className={"ref-templates"}>
                    //     <nav>
                    //         <div className="nav nav-tabs" id="nav-tab" role="tablist">
                    //             {tabButtons}
                    //         </div>
                    //     </nav>
                    //     <div className="tab-content" id="nav-tabContent">
                    //         {tabContents}
                    //     </div>
                    //     </div>

    }


    return <div className="ref-templates">
        {templatesContent}
        </div>
}

