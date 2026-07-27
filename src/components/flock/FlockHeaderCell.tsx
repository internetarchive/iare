import {useColumnSort} from "../../contexts/ColumnSortContext"
import {ColumnDef, RenderRole} from "./flockTypes"
import SortBox from "../SortBox.jsx";
// import {BadgeContexts} from "../constants/badgeContexts.jsx";
// import {urlColumnRegistry} from "../constants/urlColumnRegistry.tsx";


type HeaderColumnProps = {
    columnDef: ColumnDef;
    renderRole: RenderRole;
};

export default function FlockHeaderCell({ columnDef, renderRole }: HeaderColumnProps) {

    if (!columnDef) return null


    // sort stuff...

    const globalSort = useColumnSort()
    const globalSortKey = globalSort?.sortBy?.[0]

    let sortMarkup: any

    // display the sort box if this column is sortable (NOT if it's sorted! that's different)
    if (columnDef.sortable) {
        const mySortKey = columnDef.key
        const mySortDir = mySortKey === globalSortKey  // if this column is the primary sort column...
            ? globalSort?.sorts?.[mySortKey]?.dir ?? 0
            : 0  // no sort in this column if not specified in global sort
        sortMarkup =<div className={"header-cell-sort"}>
            <SortBox
                className={"flock-element"}
                direction={mySortDir}
            />
        </div>
    } else {
        sortMarkup = null
    }


    // content and image stuff...

    let content: any
    if (renderRole.useIcon && columnDef.logo) {
        // If columnDef contains a logo property and renderRole.useIcon is true, display the logo as an image.
        content = <div className={"flock-icon-wrapper"}>
            <img src={columnDef.logo} alt={columnDef.logoAlt || "Column Logo"} className={"flock-icon"}/>
        </div>
    } else {
        // If no logo is present, fall back to rendering the caption.
        content = columnDef.caption
    }


    // className stuff...

    const headerCellClass = [
        "flock-col",
        renderRole.className,
        `${renderRole.className}-${columnDef.key}`,
        // ...other classes here...
    ].filter(Boolean).join(" ")  // clever way of joining strings with spaces


    // dataset stuff...

    const cellDataset = { columnKey: columnDef.key }
    const datasetProps = Object.fromEntries(
        Object.entries(cellDataset).map(([key, value]) => [
            `data-${key.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`)}`,
            value
        ])
    )

    return (
        <div className={headerCellClass}
             {...datasetProps}
        >
            <div className={"header-cell-content"}>
                {content}
            </div>
            {sortMarkup}
        </div>
    )

}