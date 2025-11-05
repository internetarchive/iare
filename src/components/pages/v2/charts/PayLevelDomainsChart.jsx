import React, {useState, useRef} from 'react';
import ListChart from "../../../ListChart.jsx";
import {ACTIONS_IARE} from "../../../../constants/actionsIare.jsx";

const PayLevelDomainsChart = ({pageData, options, onAction, currentState = null}) => {

    if (!pageData?.pld_statistics) return <div>
        <p>No Pay Level Domains to show.</p>
    </div>

    // to take care of chart display area resizing
    const [height, setHeight] = useState(200);
    const resizableRef = useRef(null);
    const isResizing = useRef(false);


    const startResizing = (e) => {
        e.stopPropagation()
        e.preventDefault()
        isResizing.current = true;
        document.addEventListener("mousemove", resize);
        document.addEventListener("mouseup", stopResizing);
    };

    const resize = (e) => {
        if (isResizing.current && resizableRef.current) {
            e.stopPropagation()
            e.preventDefault()
            const newHeight = e.clientY - resizableRef.current.getBoundingClientRect().top;
            setHeight(newHeight);
        }
    };

    const stopResizing = () => {
        isResizing.current = false;
        document.removeEventListener("mousemove", resize);
        document.removeEventListener("mouseup", stopResizing);
    };


    // calc itemsArray to pass to charting component
    // assume pageData.pld_statistics is a dict of {domain: count} entries

    const itemsArray = Object.keys(pageData.pld_statistics).map( domain => {
        return {
            label: domain,
            count: pageData.pld_statistics[domain],
            link: domain,
        }
    }).sort((a, b) => {
        return a.count < b.count
            ? 1
            : a.count > b.count
                ? -1
                : a.label < b.label
                    ? 1
                    : a.label > b.label
                        ? -1
                        : 0
    })

    const onClickItem = (link) => {
        onAction({
            action: ACTIONS_IARE.SET_PAY_LEVEL_DOMAIN_FILTER.key,
            value: link
        })
    }

    /*
    return <>
        <div
            ref={resizableRef}
            style={{
                height,
                position: "relative",
                // width: "300px",
                // backgroundColor: "#f0f0f0",
                // border: "1px solid #ccc",
            }}
        >
            <div
                onMouseDown={startResizing}
                style={{
                    height: "10px",
                    background: "#aaa",
                    cursor: "ns-resize",
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                }}
            />
                <ListChart data={itemsArray}
                           className={'pay-level-domains-list-chart'}
                           currentState={currentState?.domains}
                           options={{label:"Domain", label_count: "Count"}}
                           onProbeClick={onClickItem} />
        </div>
    </>
    */

    return <>
            <ListChart data={itemsArray}
                       className={'pay-level-domains-list-chart'}
                       currentState={currentState?.domains}
                       options={{label:"Domain", label_count: "Count"}}
                       onClick={onClickItem} />
    </>
}
export default PayLevelDomainsChart;

