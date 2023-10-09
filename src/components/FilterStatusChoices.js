import React from "react";


const FilterStatusChoices = ( { filterDefs = {}, filterStatus={}, handleClick } ) => {
    // TODO to make this universal, accept a "prefix" arg to prefix classname with...e.g. "archive-" for archive-row, archive-source-name, etc.
    // render Archive Status Filter based on filterStatus state
    // go thru filterStatus state and display as encountered
    return <ul>

        {Object.keys(filterStatus).map( (filterType,i1) => {

            const filterGroup = filterStatus[filterType]
            const filterLabel = filterDefs[filterType]._.name

            const filterGroupChoices = Object.keys(filterGroup).map( (filterStatusName, i2) => {

                const status = filterGroup[filterStatusName] // the value of the setting for the sub-status of the group
                const statusClass = status ? 'filter-on' : 'filter-off'
                const inputKey = `${filterType}-${filterStatusName}`

                // label span gets replaced by image icon based on class
                const label = <span className={`filter-icon archive-${filterStatusName} ${statusClass}`}>{`${filterType}-${filterStatusName}`}</span>

                return <li key={i2}><input
                    type="checkbox"
                    id={`checkbox-${inputKey}`}
                    checked={status}

                    data-source={filterType}
                    data-status={filterStatusName}

                    onChange={handleClick}

                /><label htmlFor={`checkbox-${inputKey}`}>{label}</label>
                </li>})

            return <li className={"archive-row"}
               key={i1}
                ><span className={"filter-group-name"}>{filterLabel}</span>
                <ul>{filterGroupChoices}</ul>
            </li>

        })}
    </ul>
}

export default FilterStatusChoices
