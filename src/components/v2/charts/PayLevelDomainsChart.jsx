import React from 'react';
import ListChart from "../../ListChart.jsx";
import {ACTIONS_IARE} from "../../../constants/actionsIare.jsx";
// import ChartLegend from "./ChartLegend.jsx";

const PayLevelDomainsChart = ({pageData, options, onAction, currentState = null}) => {

    if (!pageData?.pld_statistics) return <div>
        <p>No Pay Level Domains to show.</p>
    </div>

    // assume pld_statistics is a dict of domains : count
    // calc itemsArray to pass to charting component

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
        onAction({action: ACTIONS_IARE.SET_PAY_LEVEL_DOMAIN_FILTER.key, value: link})
    }

    return <>
        <ListChart data={itemsArray} className={'pay-level-domains-list-chart'} currentState={currentState?.domains}
                   options={{label:"Domain", label_count: "Count"}}
                   onClick={onClickItem} />
    </>
}
export default PayLevelDomainsChart;