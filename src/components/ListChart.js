import React, {useState} from 'react';

/*
shows items in a list with counts
data is assumed to be an array of { label, count, link } objects, where
link is the value passed back to OnClick callback when item clicked
 */
export default function ListChart ({data, options={}, colors=["#af22e8"], className = "", onClick, currentState=null}) {

    const [sort, setSort] = useState({
        sorts: {  // holds sort value for all different sort types
            "label": {name: "label", dir: 1},  // dir: 1 is asc, -1 is desc, 0 is do not sort
            "count": {name: "count", dir: -1},
        },
        sortOrder: ["count"]  // array indicating which sorts get applied and in what order. NB this is not implemented yet, but will be
    })

    const sortFunction = (a,b) => {
        // TODO make this recursive to do collection of sort definitions as described in a "sort.sortOrder" array of key names for sort methods
        // TODO e.g: sort.sortOrder = ["references", "archive_status", "name"]
        if(sort.sortOrder[0] === "label") {
            // respect sortDir and protecting null values
            if (a?.label < b?.label) return sort.sorts['label'].dir * -1;
            if (a?.label > b?.label) return sort.sorts['label'].dir;
            return 0;
        }

        else if(sort.sortOrder[0] === "count") {
            // remedy missing values, if any
            const aVal = a?.count ? a.count : 0;
            const bVal = b?.count ? b.count : 0;

            // sort by count first
            if (aVal < bVal) return sort.sorts['count'].dir * -1;
            if (aVal > bVal) return sort.sorts['count'].dir;

            // then sort by label, respecting sortDir for label and protecting null values
            if (a?.label < b?.label) return sort.sorts['label'].dir * -1;
            if (a?.label > b?.label) return sort.sorts['label'].dir;
            return 0;
        }
        else {
            return 0  //
        }
    }

    if (!data?.length) return <div className={`list-chart${className ? ' ' + className : ''}`}>No data.</div>

    const itemData = data

    // sort items if specified
    if (sort.sortOrder?.length > 0) {
        console.log(`sorting urls by: ${sort.sortOrder[0]}`)
        itemData.sort(sortFunction)
    }

    const myLabel = options?.label ? options.label : 'Item'
    const myLabelCount = options?.label_count ? options.label_count : 'Count'

    const onClickItem = (e) => {
        const link = e.target.closest('.list-entry').dataset?.["link"]
        onClick(link)
    }

    /*
    sort items according to header field clicked.
    base sort field on class on native element clicked (using getAttribute("class"))
     */
    const onClickHeader = (e) => {
        const columnLabel = e.target.getAttribute("class");
        const which = columnLabel === "list-label"
            ? "label"
            : columnLabel === "list-count" ? "count"
                : "label"

        setSort(prevState => {
            // guarantee new sort has entry in sorts object
            if (!(prevState.sorts[which])) {
                prevState.sorts[which] = {name: which, dir: 1}
            }
            // change just the element associated with the specified sortKey
            return {
                sorts: {
                    ...prevState.sorts,
                    [which]: {
                        ...prevState.sorts[which],
                        dir: -1 * prevState.sorts[which].dir
                    }
                },
                sortOrder: [which]  // set only one for now...
            }
        })
    }

    return <div className={`list-chart${className ? ' ' + className : ''}`} >

        <div className={"list-header"} onClick={onClickHeader}>
            <div className={"list-label"}>{myLabel}</div>
            <div className={"list-count"}>{myLabelCount}</div>
        </div>

        <div className={"list-rows"} onClick={onClickItem}>
            {itemData.map((d, i) => {
                // const myColor = colors[i % colors.length]
                return <div className={`list-entry ${currentState === d.link ? 'list-entry-selected' : ''}`}
                            key={d.link}
                            data-link={d.link}>

                    {/*<div className={"list-label"} style={{backgroundColor: myColor}}>{d.label}</div>*/}
                    <div className={"list-label"}>{d.label}</div>
                    <div className={"list-count"}>{d.count}</div>

                </div>
            })}
        </div>
    </div>
}
