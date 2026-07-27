//
import {ColumnDef, RenderRole} from "./flockTypes"

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

    const cellDataset = {columnKey: columnDef.key}
    const datasetProps = Object.fromEntries(
        Object.entries(cellDataset).map(([key, value]) => [
            `data-${key.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`)}`,
            value
        ])
    )


    return (
        <div className={cellClass} {...datasetProps}>
            <div className={"cell-content"}>
                {content}
            </div>
        </div>
    )


        //     if (!columnDef) return null
        //
        //     const {
        //         caption,
        //         columnClass,
        //         logo,
        //         logoAlt = "Logo",
        //         sortable = true,
        //         priority = 1000,
        //         getContent
        //     } = columnDef;
        //
        // function RenderColumn({ columnDef, rowData }) {
        //     const value = rowData[columnDef.key];
        //
        //     return (
        //         <td className={columnDef.colClass}>
        //             {columnDef.render
        //                 ? columnDef.render({
        //                     value,
        //                     rowData,
        //                     columnDef,
        //                 })
        //                 : value
        //             }
        //         </td>
        //     );
}