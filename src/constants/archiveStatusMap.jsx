const myCategory = "Archive Status"

export const ARCHIVE_STATUS_MAP = {

    archived: {
        key: "archived",
        category: myCategory,
        caption: "Has Archive",
        desc: "Link is archived.",
        filterDescription: "Archive exists",
        filterFunction: () => (url) => {
            return !!url.archive_data?.archive_exists  // NB: double negative === truthy
        },
    },

    no_archive: {
        key: "no_archive",
        category: myCategory,
        caption: "No Archive",
        desc: "Link is not archived.",
        filterDescription: "Archive does not exist",
        filterFunction: () => (url) => {
            return !url.archive_data?.archive_exists  // NB: double negative === truthy
        },
    },

}
