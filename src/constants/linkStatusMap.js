import {isLinkStatusGood} from "../utils/utils";

const myCategory = "Link Status"

const isLinkStatusBad = (statusCode) => {
    return statusCode < 200 || statusCode >= 400
}

export const LINK_STATUS_MAP = {
    good: {
        category: myCategory,
        caption: "Links OK",
        desc: "Link is OK or Has Archive",
        filterFunction: () => (url) => {
            return isLinkStatusGood(url.status_code) || !!url.archive_status?.hasArchive  // NB: double negative === truthy
        },
        refFilterFunction: () => (urlDict, ref) => {
            return ref.urls.some( url => {
                const urlObject = urlDict[url]
                if (!urlObject) return false
                return isLinkStatusGood(urlObject.status_code) || !!urlObject.archive_status?.hasArchive  // NB: double negative
            })
        }
    },

    bad: {
        category: myCategory,
        caption: "Links NOT OK",
        desc: "Original Link status is NOT OK, and there is NO Archive",
        filterFunction: () => (url) => {
            return isLinkStatusBad(url.status_code) && !url.archive_status?.hasArchive
        },
        refFilterFunction: () => (urlDict, ref) => {
            return ref.urls.some( url => {
                const urlObject = urlDict[url]
                if (!urlObject) return false
                if (urlObject.isArchive) return false
                // return isLinkStatusBad(urlObject.status_code) && !urlObject.archive_status?.hasArchive

                const passed = isLinkStatusBad(urlObject.status_code) && !urlObject.archive_status?.hasArchive
                // const passed = isLinkStatusBad(urlObject.status_code) && !urlObject.archive_status?.hasArchive
                return passed
            })
        }
    },
}
