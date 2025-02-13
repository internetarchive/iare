export const IariSources = {
  iari: {
    key: "iari",
    caption: "IARI",
    proxy: "https://archive.org/services/context/iari/v2",
    statusMessages: {
      permalive: "IARI is fully operational and responding to requests.",
      permadead:
        "IARI is currently unavailable and not responding to requests.",
    },
  },
  iari_prod: {
    key: "iari_prod",
    caption: "IARI Prod",
    proxy: "https://iabot-api.archive.org/services/context/iari-prod/v2",
    statusMessages: {
      permalive: "IARI Prod is fully operational and responding to requests.",
      permadead:
        "IARI Prod is currently unavailable and not responding to requests.",
    },
  },
  iari_stage: {
    key: "iari_stage",
    caption: "IARI Stage",
    proxy: "https://iabot-api.archive.org/services/context/iari-stage/v2",
    statusMessages: {
      permalive: "IARI Stage is fully operational and responding to requests.",
      permadead:
        "IARI Stage is currently unavailable and not responding to requests.",
    },
  },
  iari_test: {
    key: "iari_test",
    caption: "IARI Test",
    proxy: "https://iabot-api.archive.org/services/context/iari-test/v2",
    statusMessages: {
      permalive: "IARI Test is fully operational and responding to requests.",
      permadead:
        "IARI Test is currently unavailable and not responding to requests.",
    },
  },
  iari_local: {
    key: "iari_local",
    caption: "IARI Local",
    proxy: "http://localhost:5000/v2",
    statusMessages: {
      permalive: "IARI Local is fully operational and responding to requests.",
      permadead:
        "IARI Local is currently unavailable and not responding to requests.",
    },
  },
};
