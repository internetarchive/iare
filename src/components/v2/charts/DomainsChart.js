import React from 'react';
import ListChart from "../../ListChart";
import {IARE_ACTIONS} from "../../../constants/iareActions";
// import ChartLegend from "./ChartLegend";

const DomainsChart = ({pageData, options, onAction, currentState = null}) => {

    if (!pageData?.fld_counts) return <div>
        <p>No Pay Level Domains to show.</p>
    </div>

    // assume fld_counts is a dict of domains with count as value
    const itemsArray = Object.keys(pageData.fld_counts).map( domain => {
        return {
            label: domain,
            count: pageData.fld_counts[domain],
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
        onAction({action: IARE_ACTIONS.SET_DOMAIN_FILTER.key, value: link})
    }

    return <>
        <ListChart data={itemsArray} className={'domains-list-chart'} currentState={currentState?.domains}
                   options={{label:"Domain", label_count: "Count"}}
                   onClick={onClickItem} />
    </>
}
export default DomainsChart;