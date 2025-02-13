export const URL_STATUS_FILTER_MAP = {
  all: {
    caption: "Show All",
    desc: "All URLs are shown",
    filterFunction: () => () => {
      return true;
    },
  },
  status2XX: {
    caption: "Status 2XX",
    desc: "URL Link HTTP Status code is in the 2XX range.",
    filterFunction: () => (d) => {
      return d.status_code >= 200 && d.status_code < 300;
    },
  },
  status3XX: {
    caption: "Status 3XX",
    desc: "URL Link HTTP Status code is in the 3XX range.",
    filterFunction: () => (d) => {
      return d.status_code >= 300 && d.status_code < 400;
    },
  },
  status4XX: {
    caption: "Status 4XX",
    desc: "URL Link HTTP Status code is in the 4XX range.",
    filterFunction: () => (d) => {
      return d.status_code >= 400 && d.status_code < 500;
    },
  },
  status5XX: {
    caption: "Status 5XX",
    desc: "URL Link HTTP Status code is in the 5XX range.",
    filterFunction: () => (d) => {
      return d.status_code >= 500 && d.status_code < 600;
    },
  },
  statusUnknown: {
    caption: "Unknown Status",
    desc: "URL Link HTTP Status is Unknown, possibly because of non-response.",
    filterFunction: () => (d) => {
      return !d.status_code;
    },
  },
};

export const ARCHIVE_STATUS_FILTER_MAP = {
  iabot: {
    _: {
      name: (
        <>
          Archive
          <br />
          Status
        </>
      ),
    },

    permalive: {
      caption: "Permalive: URL is permanently alive (archived)",
      desc: "The URL is permanently alive and has been successfully archived by IABot.",
      default: false,
      filterFunction: () => (url) => {
        return (
          url.archive_status?.hasArchive && url.archive_status?.isPermalive
        );
      },
    },
    permadead: {
      caption: "Permadead: URL is permanently dead (not archived)",
      desc: "The URL is permanently dead and could not be archived by IABot.",
      default: false,
      filterFunction: () => (url) => {
        return (
          !url.archive_status?.hasArchive && url.archive_status?.isPermadead
        );
      },
    },
    unknown: {
      caption: "Unknown: Archive status is unclear",
      desc: "The archive status of the URL is unknown or not determined by IABot.",
      default: false,
      filterFunction: () => (url) => {
        return (
          !url.archive_status?.hasArchive && !url.archive_status?.isPermadead
        );
      },
    },
    all: {
      caption: "All: Include all archive statuses",
      desc: "Include URLs with any archive status (permalive, permadead, or unknown).",
      default: false,
      filterFunction: () => (url) => {
        return true;
      },
    },
  },

  iari: {
    _: { name: "IARI" },

    yes: {
      caption: "URL has archive in page URLs",
      desc: "Archive link found in page URLs.",
      default: false,
      filterFunction: () => (url) => {
        return !!url.hasArchive;
      },
    },
    no: {
      caption: "URL has no archive in page URLs",
      desc: "Archive link not found in page URLs.",
      default: false,
      filterFunction: () => (url) => {
        return !url.hasArchive;
      },
    },
    all: {
      caption: "Archive in page URLs is anything",
      desc: "Archive in page URLs is anything.",
      default: false,
      filterFunction: () => (url) => {
        return true;
      },
    },
  },

  template: {
    _: { name: "Cite" },
    yes: {
      caption: "Template has archive URL",
      desc: "Template has archive URL.",
      default: false,
      filterFunction: () => (url) => {
        return url.hasTemplateArchive;
      },
    },
    no: {
      caption: "Template does not have archive URL",
      desc: "Template does not have archive URL",
      default: false,
      filterFunction: () => (url) => {
        return !url.hasTemplateArchive;
      },
    },
    all: {
      caption: "Cite archive status is anything",
      desc: "Cite archive status is anything.",
      default: false,
      filterFunction: () => (url) => {
        return true;
      },
    },
  },
};
