import {useColumnSort} from "../../contexts/ColumnSortContext"
import {ColumnDef, RenderRole} from "./flockTypes"
import SortBox from "../SortBox.jsx";
import {collateClasses, collateDatasetProps} from "../../utils/generalUtils";
// import {BadgeContexts} from "../constants/badgeContexts.jsx";
// import {urlColumnRegistry} from "../constants/urlColumnRegistry.tsx";


type HeaderColumnProps = {
    columnDef: ColumnDef;
    renderRole: RenderRole;
};

export default function FlockHeaderCell({columnDef, renderRole}: HeaderColumnProps) {

    if (!columnDef) return null


    // sort stuff...

    let sortMarkup: any

    // display the sort box if this column is sortable (NOT if it's sorted! that's different)
    if (columnDef.sortable) {
        if (renderRole.hasSort) {
            const globalSort = useColumnSort();
            // todo exception trap this...
            //  display err no sort if caught...
            //  we must be inside a sort context for useColumnSort to be valid
            const globalSortKey = globalSort?.sortBy?.[0];

            const mySortKey = columnDef.key
            const mySortDir = mySortKey === globalSortKey  // if this column is the primary sort column...
                ? globalSort?.sorts?.[mySortKey]?.dir ?? 0
                : 0;  // no sort in this column if not specified in global sort
            sortMarkup = <div className={"header-cell-sort"}>
                <SortBox
                    className={"flock-element"}
                    direction={mySortDir}
                />
            </div>
        } else {
            sortMarkup = null
            // sortMarkup = <span className="triangle-icon-exclamation">!</span>
        }
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


    // dataset stuff...

    const datasetProps = collateDatasetProps({
        columnKey: columnDef.key
    })

    return (
        <div className={`flock-col ${renderRole.className}-${columnDef.key}`}
             {...datasetProps}
        >
            <div className={"header-cell"}>
                {content}
            </div>
            {sortMarkup}
        </div>
    )

}