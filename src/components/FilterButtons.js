import React from "react";
import FilterButton from "./FilterButton";


export default function FilterButtons ( {
                flock,
                filterMap,
                filterList = [],
                onClick,
                caption = "Filters",
                className = "",
                currentFilterName = "",
                onRender = null
           }) {

    // if filterList is empty, use all keys for filterMap
    // otherwise, just show the keys as described in filterList array
    const keyList = filterList.length === 0
        ? Object.keys(filterMap) // use all keys of map if specified filterList is empty
        : filterList;

    const handleClick = (e) => {
        onClick(e); // might want to decorate this later...
    }

    return <div className={`filter-box ${className}`}>
        {caption?<h4>{caption}</h4>:null}
        <div className={`filter-buttons ${className}`}>

            {keyList.map( name => {

                let f = filterMap[name];

                // calc count of filter results as applied to flock
                f.count = flock ? flock.filter((f.filterFunction)()).length : 0;
                f.name = name // for render function

                return <FilterButton key={name}
                    name={name}
                    caption={f.caption}
                    count={f.count}
                    isPressed={name === currentFilterName}
                    onClick={handleClick}

                    desc={f.desc}
                    useDesc={false}
                    onRender={onRender}

                    filter={f}
                    />
            })}

        </div>
    </div>

}
