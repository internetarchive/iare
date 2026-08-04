// ColumnSortContext.tsx

import { createContext, useContext } from "react";

//// export const ColumnSortContext = createContext(null)
// export const ColumnSortContext =
//     createContext<ColumnSortContextValue | null>(null);


export const ColumnSortContext = createContext<any>(null)

export function useColumnSort(): any {
    const context = useContext(ColumnSortContext);

    if (!context) {
        throw new Error(
            "useColumnSort must be used within a ColumnSortContext.Provider"
        );
    }

    return context;
}