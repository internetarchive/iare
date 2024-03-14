import {fetchUrl} from "../../utils/iariUtils";
import {UrlStatusCheckMethods} from "../../constants/checkMethods.js"
import RawJson from "../RawJson";

export const gridDef = {

    item_status: {
        name: "status",
        caption: "Status",
        tooltip: "status of fetch for this item"
    },

    item_column: {
        name: "url",
        caption: "URL",
        tooltip: "URL to check"
    },

    column_order: ["lwc", "iabot", "corentin"],

    data_columns: {

        lwc: {
            name: "lwc",
            caption: "LWC",
            tooltip: "Status from Wayback Machine's Live Web Check",
            // ??? do we have a "resolve" method? or os that included in operation?
            operation: () => async (item, options) => {
                const iariBase = options.iariBase
                const startTime = performance.now()
                const results = await fetchUrl({
                    iariBase: iariBase,
                    url: item,
                    refresh: true,
                    // timeout:timeout,
                    method: UrlStatusCheckMethods.WAYBACK.key
                })
                const endTime = performance.now();
                const elapsedTime = endTime - startTime;

                // here is where we can check error code
                // and coerce into "standard" format
                const return_data = {
                    status_code: results.data.status_code,
                    status_code_error_details: results.data.status_code_error_details,
                    elapsed: elapsedTime,
                }
                return {
                    key: "lwc",
                    data: return_data,
                }
            },
            render: "url_status_array"
        },

        iabot: {
            name: "iabot",
            caption: "IABot",
            tooltip: "Status from IABot testdeadlink API",
            operation: () => async (item, options) => {
                const iariBase = options.iariBase
                const startTime = performance.now()
                const results = await fetchUrl({
                    iariBase: iariBase,
                    url: item,
                    refresh: true,
                    // timeout:timeout,
                    method: UrlStatusCheckMethods.IABOT.key
                })

                const endTime = performance.now();
                const elapsedTime = endTime - startTime;

                // here is where we can check error code
                // and coerce into "standard" format
                const return_data = {
                    status_code: results.data.status_code,
                    status_code_error_details: results.data.status_code_error_details,
                    elapsed: elapsedTime,
                }
                return {
                    key: "iabot",
                    data: return_data,
                }
            },
            render: "url_status_array"
        },

        corentin: {
            name: "corentin",
            caption: "Corentin",
            tooltip: "Status from Corentin",
            operation: () => async (item, options) => {
                const iariBase = options.iariBase
                const startTime = performance.now()
                const results = await fetchUrl({
                    iariBase: iariBase,
                    url: item,
                    refresh: true,
                    // timeout:timeout,
                    method: UrlStatusCheckMethods.CORENTIN.key
                })

                const endTime = performance.now();
                const elapsedTime = endTime - startTime;

                // here is where we can check error code
                // and coerce into "standard" format
                const return_data = {
                    status_code: results.data.status_code,
                    status_code_error_details: results.data.status_code_error_details,
                    elapsed: elapsedTime,
                }
                return {
                    key: "corentin",
                    data: return_data,
                }
            },
            render: "url_status_array"
        },

        other: {
            name: "other",
            caption: "Other",
            tooltip: "Test column type, \"other\" for now",
            operation: () => async (item, options) => {
                return {key: "iabot", data: "other return"}
            },
            render: "custom",
            render_function: () => (data) => {
                return <div><RawJson obj={data}/></div>
            }
        }
    }
}
