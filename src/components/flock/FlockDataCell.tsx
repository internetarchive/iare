//
import {ColumnDef, RenderRole} from "./flockTypes"
import {collateDatasetProps} from "../../utils/generalUtils";

type ColumnProps = {
    columnDef: ColumnDef;
    renderRole: RenderRole;
    cellData: Object;
};

export default function FlockDataCell({ columnDef, renderRole, cellData }: ColumnProps) {

    if (!columnDef) return null


    // className stuff...

    const cellClass = [
        "flock-col",
        renderRole.className + "-" + columnDef.key,
        // ...other classes here...
    ].filter(Boolean).join(" ")  // clever way of joining strings with spaces


    // content and image stuff...

    const content = columnDef.renderCell(cellData)


    // dataset stuff...

    const datasetProps = collateDatasetProps({
        columnKey: columnDef.key,
        // status_code: cellData?.status_code,
    })


    return (
        <div className={cellClass} {...datasetProps}>
            <div className={"cell-content"}>
                {content}
            </div>
        </div>
    )
}
