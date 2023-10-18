import React, {useState} from "react";
import {Tooltip as MyTooltip} from "react-tooltip";
import {REF_LINK_STATUS_FILTERS as linkDefs} from "../filters/refFilterMaps";

export default function RefLinkStatus( {details = {}, onClick=()=>{} } ) {

    const [tooltipHtmlLinkStatus, setTooltipHtmlLinkStatus] = useState( '<div>ToolTip<br />second line</div>' );

    const onHoverLinkStatus = (e) => {
        const linkStatus = e.target.dataset['linkStatus']
        const html = `<div>${linkDefs[linkStatus]?.desc ? linkDefs[linkStatus]?.desc : "Unknown link status"}</div>`
        setTooltipHtmlLinkStatus(html)
    }

    const tooltip = <MyTooltip id="link-status-tooltip"
                               float={true}
                               closeOnEsc={true}
                               delayShow={420}
                               variant={"info"}
                               noArrow={true}
                               offset={5}
                               className={"link-status-tooltip"}
    />


    return <div className={"ref-view-link-status"} >

        <h3>Links Status:</h3>

        <div className={`ref-link-status-wrapper`}
             data-tooltip-id="link-status-tooltip"
             data-tooltip-html={tooltipHtmlLinkStatus}
        >
            {details.link_status
                // display link_status array values
                ? (details.link_status.length
                    ? details.link_status.map( (linkStatus, i)  => {
                        return <span className={`ref-link-status link-status-${linkStatus}`}
                             key={i}
                             data-link-status={linkStatus}
                             onClick={onClick}
                             onMouseOver={onHoverLinkStatus}
                        />
                    })
                    : <span className={`ref-link-status link-status-missing`} onMouseOver={onHoverLinkStatus} /> )
                : <span className={`ref-link-status link-status-missing`} onMouseOver={onHoverLinkStatus} /> }
        </div>

        {tooltip}

    </div>
}

