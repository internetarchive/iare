export const testGridData = {

    "https://www.bbc.com/news/business-63953096": {

        row_info: {
            item_name: "https://www.bbc.com/news/business-63953096",
            fetch_status: -1,  // 0 = fetching, 1 = fetched, other = unknown
                // row_info.fetch_status gets changed when data invoked and data received
            fetch_timestamp: null,  // when fetch was made
        },

        row_data: {  // keyed by column_type

            "lwc": {  // key for each operation (as defined in gridDef)

                data: [
                    // data is set as an array to allow values from multiple calls.
                    // this gives us an opportunity to set aggregates such as average
                    {
                        value: "?",  // data to show
                        elapsed: 100,  // time it took for operation
                        timestamp: null,
                    }
                ]
            },

            "iabot": {
                data: [
                    {
                        value: "?",  // data to show
                        elapsed: 100,  // time it took for operation
                        timestamp: null,
                    }
                ]
            },
            "corentin": {
                data: [
                    {
                        value: "?",  // data to show
                        elapsed: 100,  // time it took for operation
                        timestamp: null,
                    }
                ]
            }
        }
    },

    "https://www.politico.com/amp/news/2022/11/09/crypto-megadonor-sam-bankman-fried-00066062": {

        key: "https://www.politico.com/amp/news/2022/11/09/crypto-megadonor-sam-bankman-fried-00066062",

        row_info: {
            item_name: "https://www.politico.com/amp/news/2022/11/09/crypto-megadonor-sam-bankman-fried-00066062",
            fetch_status: -1,
            fetch_timestamp: null,
        },

        row_data: {

            "lwc": {  // key for each operation (as defined in gridDef)
                data: [
                    // values is set as an array to allow values from multiple calls.
                    // this gives us an opportunity to set aggregates such as average
                    {
                        value: "?",  // data to show
                        elapsed: 100,  // time it took for operation
                        timestamp: null,
                    }
                ]
            },

            "iabot": {
                data: [
                    {
                        value: "?",  // data to show
                        elapsed: 100,  // time it took for operation
                        timestamp: null,
                    }
                ]
            },
            "corentin": {
                data: [
                    {
                        value: "?",  // data to show
                        elapsed: 100,  // time it took for operation
                        timestamp: null,
                    }
                ]
            }
        }
    },
}
