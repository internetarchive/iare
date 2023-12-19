import React, {useState} from "react";
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';

/*
shows tabs of template params if there; 1 tab for each template
 */
export default function RefTemplates({ templates }) {

    const [key, setKey] = useState('template_1');

    function Parameters({parameters}) {
        if (!parameters) {
            return <p>No parameters for Template!</p>
        }

        const keyNames = Object.keys(parameters).filter(name => name !== "template_name")
        // // keyNames.sort();

        // Sort items as: title, url, archive_url, url_status on top;
        // template_name on bottom,
        // rest alpha...

        keyNames.sort((keyA,keyB) => {
            // ensure first ones sort in this order at the top...
            if (keyA === "title" || keyB === "title") return (keyA === "title" ? -1 : 1)
            if (keyA === "url" || keyB === "url") return (keyA === "url" ? -1 : 1)
            if (keyA === "archive_url" || keyB === "archive_url") return (keyA === "archive_url" ? -1 : 1)
            if (keyA === "url_status" || keyB === "url_status") return (keyA === "url_status" ? -1 : 1)

            // ensure template_name always places last
            if (keyA === "template_name" || keyB === "template_name") return (keyA === "template_name" ? 1 : -1)

            // if (keyA > keyB) return 1;
            // if (keyB > keyA) return -1;
            return 0;
        })

        return keyNames.map((key, i) => {
            // show with styling for param name and value
            return <div className={`param-row`} key={i}>
                <div className={"col-3 param-name"}>{key}</div>
                <div className={"col-9 param-value"}>{parameters[key]}</div>
            </div>
        })

    }


    const getTabContent = (templates) => {
        if (!templates || !templates.length) {
            return <Tab title={"No Templates"} disabled={true} >
                <p>No Templates to show</p>
            </Tab>
        }

        let n = 0;
        // loop thru each template set
        return templates.map(t => {
            n++;
            const tabID = `template_${n}`;
            const name = t.parameters && t.parameters.template_name ? t.parameters.template_name : `Template ${n}`;

            return <Tab eventKey={tabID} key={tabID} title={name}>
                <div className={'parameters'}>
                    <Parameters parameters={t.parameters} />
                </div>
            </Tab>
        })
    }

    return <div className="ref-templates">
        <h3 className={"templates-header"}>Templates</h3>
        <Tabs
            id="ref-template-tabs"
            activeKey={key}
            onSelect={(k) => setKey(k)}
            className="mb-3"
            variant={"pills"}
            >
            {getTabContent(templates)}
        </Tabs>
    </div>
}

