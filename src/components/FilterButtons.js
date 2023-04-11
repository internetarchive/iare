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
           }) {

    const keyList = filterList.length === 0
        ? Object.keys(filterMap) // use all keys of map if specified filterList is empty
        : filterList;

    const handleClick = (e) => {
        onClick(e); // might want to decorate this later...
    }

    return <div className={"filter-box"}>
        <h4>{caption}</h4>
        <div className={`filter-buttons ${className}`}>
            {keyList.map((name) => {
                let f = filterMap[name];
                f.count = flock ? flock.filter((f.filterFunction)()).length : 0;
                return <FilterButton key={name}
                    name={name}
                    caption={f.caption}
                    count={f.count}
                    isPressed={name === currentFilterName}
                    onClick={handleClick}

                    desc={f.desc}
                    useDesc={false}
                    />
            })}
        </div>
    </div>

}
