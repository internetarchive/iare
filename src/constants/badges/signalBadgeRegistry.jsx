// signalBadgeRegistry.jsx

// import DeadLinkBadge from "./badges/DeadLinkBadge";
// import ArchiveBadge from "./badges/ArchiveBadge";
// import PaywallBadge from "./badges/PaywallBadge";

import WaybackBadge from "./WaybackBadge.jsx";
import EnwikiBadge from "./EnwikiBadge.jsx";
import TrancoBadge from "./TrancoBadge";
import MbfcBadge from "./MbfcBadge";

export const signalBadgeRegistry = {
    tranco: {
        key: "tranco",
        caption: "TRANCO",
        description: "Tranco rating (website)",
        component: TrancoBadge,
        priority: 100,
        group: "",
    },

    mbfc: {
        key: "mbfc",
        caption: "Media Bias Fact Check",
        description: "Media Bias Fact Check (website)",
        component: MbfcBadge,
        priority: 200,
        group: "",
    },

    enwiki: {
        key: "enwiki",
        caption: "English Wiki Link Count",
        component: EnwikiBadge,
        priority: 300,
        group: "",
    },

    wayback: {
        key: "wayback",
        caption: "Wayback Machine Statistics (Longevity)",
        component: WaybackBadge,
        priority: 400,
        group: "",
    },


}
