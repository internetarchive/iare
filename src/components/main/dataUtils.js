import {fetchUrl} from "../../utils/iariUtils"
export const nowTime = () => {
    // Create a new Date object
    const currentDate = new Date();

// Get the current hours, minutes, and seconds
    const hours = currentDate.getHours();
    const minutes = currentDate.getMinutes();
    const seconds = currentDate.getSeconds();
    const milliseconds = currentDate.getMilliseconds();

    // Format the timestamp
    return `${hours}:${minutes}:${seconds}:${milliseconds}`;
}


export const fetchColumnData = async (iariBase, item, columnType) => {
    // assumes all promises successful
    // TODO: error trap this promise call with a .catch
    // split based on column data type

    if (columnType === "lwc") {
        return fetchUrlLwc(iariBase, item)  // todo: change "wayback" to LWC
    }

    if (columnType === "iabot") {
        return fetchUrlIabot(iariBase, item)
    }

    if (columnType === "corentin") {
        return fetchUrlCorentin(iariBase, item)
    }


}

const fetchUrlLwc = async (iariBase, url) => {
    const results = fetchUrl({
        iariBase:iariBase,
        url: url,
        refresh: true,
        timeout:2,
        method: "wayback"}
    )

    // process results so that we return something like:
    /*
    {
        type: "lwc",
        data: <status code>
    }
     */

    return {
        type: "lwc",
        data: results.status_code
    }

    // we also have available: status_code_error_details and archive_status
}

const fetchUrlIabot = async (iariBase, url) => {
    const results = fetchUrl({
        iariBase:iariBase,
        url: url,
        refresh: true,
        timeout:2,
        method: "iabot"}
    )

    // process results so that we return something like:
    /*
    {
        type: "lwc",
        data: <status code>
    }
     */

    return {
        type: "iabot",
        data: results.status_code
    }

    // we also have available: status_code_error_details and archive_status
}

const fetchUrlCorentin = async (iariBase, url) => {
    // const results = fetchUrl({
    //     iariBase:iariBase,
    //     url: url,
    //     refresh: true,
    //     timeout:2,
    //     method: "corentin"}
    // )
    //
    // use checkUrlsCorentin
    //
    return {
        type: "corentin",
        data: "XXX"
    }
}


/*
row element (of rows):
    {
        item: "https://www.bbc.com/news/business-63953096",
        columns: [
            {
                type:"lwc",
                data: "?"
            },
            {
                type:"iabot",
                data: "?"
            },
            {
                type:"corentin",
                data: "?"
            },
        ]
    },

 */
