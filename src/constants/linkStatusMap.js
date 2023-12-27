import {isLinkStatusGood, isLinkStatusBad} from "../utils/utils";
export const LINK_STATUS_MAP = {
    good: {
        caption: "Links OK",
        desc: "Link is OK or Has Archive",
        filterFunction: () => (url) => {
            return isLinkStatusGood(url.status_code) || !!url.archive_status?.hasArchive  // NB: double negative
        },
    },

    bad: {
        caption: "Links NOT OK",
        desc: "Original Link status is NOT OK, and there is NO Archive",
        filterFunction: () => (url) => {
            return isLinkStatusBad(url.status_code) && !url.archive_status?.hasArchive
        },
    },
}
