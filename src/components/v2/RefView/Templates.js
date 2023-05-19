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
                const name = t.parameters && t.parameters.template_name ? t.parameters.template_name : `Template ${n}`;

                const templateParams = t.parameters

                    ?  Object.keys(t.parameters).map((key, i) => {
                        // show with styling for param name and value
                        return <div className={`param-row`} key={i}>
                            <div className={"col-3 param-name"}>{key}</div>
                            <div className={"col-9 param-value"}>{t.parameters[key]}</div>
                        </div>
                        })

                    : <p>No parameters for Template!</p>

                return <Tab eventKey={tabID} key={tabID} title={name}>
                    <div className={'parameters'}>
                        {templateParams}
                    </div>
                </Tab>


            })

        }

        templatesContent = <Tabs
            id="ref-template-tabs"
            activeKey={key}
            onSelect={(k) => setKey(k)}
            className="mb-3"
            variant={"pills"}
        >
            {getTemplateTabs(templates)}
        </Tabs>

    }


    return <div className="ref-templates">
        <h3 className={"templates-header"}>Templates</h3>
        {templatesContent}
        </div>
}

