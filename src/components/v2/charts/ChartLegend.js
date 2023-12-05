import React from 'react';

/*
shows chart legend derived from data.
data is assumed to be an array of { label, count } objects
 */
const ChartLegend = ({data, colors, className = "", onClick}) => {

    if (!data?.length) return <div className={`chart-legend${className ? ' ' + className : ''}`}>No data for legend.</div>
    
    return <div className={`chart-legend${className ? ' ' + className : ''}`} onClick={onClick}>
        {data.map( (d, i) => {
            const myColor = colors[i % colors.length]
            return <div className={"legend-entry"}
                        key={d.link}
                        data-link={d.link} >
                <div className={"legend-box"} style={{backgroundColor:myColor}}></div>
                <div className={"legend-label"}>{d.label} <span className={"lolite"}> [{d.count}]</span></div>
            </div>
        })}
    </div>

}

export default ChartLegend