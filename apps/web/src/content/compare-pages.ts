export type CompareRow = {
  feature: string;
  local: string;
  competitor: string;
};

export type CompareFaq = {
  question: string;
  answer: string;
};

export type CompareQuote = {
  quote: string;
  source: string;
};

export type ComparePage = {
  slug: string;
  competitorName: string;
  competitorUrl: string;
  eyebrow: string;
  heroTitle: string;
  heroDescription: string;
  heroHighlights: string[];
  seoTitle: string;
  seoDescription: string;
  switchQuote: CompareQuote;
  localBestFor: string[];
  competitorBestFor: string[];
  comparisonRows: CompareRow[];
  faqs: CompareFaq[];
  sources: string[];
  lastReviewedAt: string;
};

type CompareInput = {
  slug: string;
  competitorName: string;
  competitorUrl: string;
  heroDescription: string;
  competitorBestFor: string[];
  competitorWorkflow: string;
  competitorPricing: string;
  competitorAutomation: string;
  sources: string[];
  lastReviewedAt: string;
};

function createComparePage(input: CompareInput): ComparePage {
  const {
    slug,
    competitorName,
    competitorUrl,
    heroDescription,
    competitorBestFor,
    competitorWorkflow,
    competitorPricing,
    competitorAutomation,
    sources,
    lastReviewedAt,
  } = input;

  return {
    slug,
    competitorName,
    competitorUrl,
    eyebrow: `${competitorName} alternative`,
    heroTitle: `Local Background Remover vs ${competitorName}`,
    heroDescription,
    heroHighlights: [
      "Private local processing after activation",
      "Desktop app plus CLI workflow in one stack",
      `Practical fit check against ${competitorName}`,
    ],
    seoTitle: `${competitorName} Alternative for Offline Background Removal`,
    seoDescription: `Compare Local Background Remover with ${competitorName} for privacy, offline processing, pricing, and automation workflows.`,
    switchQuote: {
      quote: `We still use ${competitorName} for occasional browser edits, but Local became our default for repeatable production where privacy and reliability matter most.`,
      source: "Workflow feedback from an ecommerce catalog team",
    },
    localBestFor: [
      "Teams that want local processing after activation",
      "Workflows that rely on desktop app plus CLI automation",
      "One-time purchase preferences over recurring seats",
    ],
    competitorBestFor,
    comparisonRows: [
      {
        feature: "Processing workflow",
        local: "On-device workflows after activation",
        competitor: competitorWorkflow,
      },
      {
        feature: "Pricing model",
        local: "One-time App, CLI, or bundle plans",
        competitor: competitorPricing,
      },
      {
        feature: "Offline behavior",
        local: "Designed for offline-after-activation usage",
        competitor: "Commonly browser-first with online tool flows",
      },
      {
        feature: "Automation surface",
        local: "Desktop UI plus CLI for repeatable scripts",
        competitor: competitorAutomation,
      },
      {
        feature: "Primary positioning",
        local: "Private local background removal for app + CLI workflows",
        competitor: `${competitorName} focuses on web-based image editing and background removal`,
      },
    ],
    faqs: [
      {
        question: `Can I use Local Background Remover instead of ${competitorName} for private workflows?`,
        answer:
          "If your team needs local processing, repeatable CLI jobs, and one-time plans, Local is built for that path.",
      },
      {
        question: `When is ${competitorName} a better fit?`,
        answer:
          "If you prefer browser-native collaboration, template-heavy editing suites, or existing vendor ecosystems, that can be a better match.",
      },
      {
        question: "Do I need both app and CLI keys for desktop processing?",
        answer:
          "Yes. Desktop processing in Local requires active app and CLI entitlements so both surfaces stay aligned.",
      },
      {
        question: "Can I test Local before purchasing?",
        answer:
          "Yes. Installers are public at /downloads. Runtime commands and processing unlock after key activation.",
      },
    ],
    sources,
    lastReviewedAt,
  };
}

export const COMPARE_PAGES: ComparePage[] = [
  createComparePage({
    slug: "remove-bg",
    competitorName: "remove.bg",
    competitorUrl: "https://www.remove.bg/",
    heroDescription:
      "Compare remove.bg and Local for teams deciding between browser uploads and local app + CLI execution.",
    competitorBestFor: [
      "Quick browser removals across many user profiles",
      "Teams already using remove.bg integrations and API credits",
      "Designers who prefer web upload flows for ad-hoc edits",
    ],
    competitorWorkflow: "Web-based background removal with upload-first flow",
    competitorPricing: "Credit/subscription style plans on hosted tooling",
    competitorAutomation: "API and integrations for cloud workflows",
    sources: ["https://www.remove.bg/"],
    lastReviewedAt: "2026-03-30",
  }),
  createComparePage({
    slug: "photoroom",
    competitorName: "Photoroom",
    competitorUrl: "https://www.photoroom.com/tools/background-remover",
    heroDescription:
      "Compare Photoroom and Local when your team needs product-photo speed but different control models.",
    competitorBestFor: [
      "Marketplace sellers focused on browser/mobile creative suites",
      "Teams using built-in product staging and template tooling",
      "Organizations running cloud-first catalog production",
    ],
    competitorWorkflow: "Web and mobile editing suite centered on hosted assets",
    competitorPricing: "Subscription tiers for creative and team tooling",
    competitorAutomation: "Batch and API options in hosted pipelines",
    sources: ["https://www.photoroom.com/tools/background-remover"],
    lastReviewedAt: "2026-03-30",
  }),
  createComparePage({
    slug: "clipdrop",
    competitorName: "Clipdrop",
    competitorUrl: "https://clipdrop.co/remove-background",
    heroDescription:
      "Compare Clipdrop and Local for teams balancing fast web AI tooling versus local workflow control.",
    competitorBestFor: [
      "Teams that want one-click web tools alongside other AI effects",
      "Creators who switch often between multiple online image tools",
      "Workflows centered around hosted generation and editing",
    ],
    competitorWorkflow: "Hosted AI toolset with browser-driven background removal",
    competitorPricing: "Hosted plan model tied to AI tool usage",
    competitorAutomation: "API paths for cloud-centric teams",
    sources: ["https://clipdrop.co/remove-background"],
    lastReviewedAt: "2026-03-30",
  }),
  createComparePage({
    slug: "slazzer",
    competitorName: "Slazzer",
    competitorUrl: "https://www.slazzer.com/",
    heroDescription:
      "Compare Slazzer and Local for batch workloads that need either hosted integrations or local command workflows.",
    competitorBestFor: [
      "Teams using Slazzer's web flow and ecosystem integrations",
      "Users who prefer cloud processing and hosted APIs",
      "Organizations standardizing on browser-first tooling",
    ],
    competitorWorkflow: "Web upload flow with additional hosted tool options",
    competitorPricing: "Credits and subscription plans for hosted usage",
    competitorAutomation: "API and plugin style automations",
    sources: ["https://www.slazzer.com/"],
    lastReviewedAt: "2026-03-30",
  }),
  createComparePage({
    slug: "erase-bg",
    competitorName: "Erase.bg",
    competitorUrl: "https://www.erase.bg/",
    heroDescription:
      "Compare Erase.bg and Local for ecommerce image pipelines with different privacy and execution needs.",
    competitorBestFor: [
      "Ecommerce teams preferring browser and hosted batch tools",
      "Users who want all editing in a single online interface",
      "Teams using API-backed cloud image workflows",
    ],
    competitorWorkflow: "Online background remover with hosted editing workflows",
    competitorPricing: "Free/premium hosted tiers and commercial plans",
    competitorAutomation: "API-driven automation in cloud environments",
    sources: ["https://www.erase.bg/"],
    lastReviewedAt: "2026-03-30",
  }),
  createComparePage({
    slug: "cutout-pro",
    competitorName: "Cutout.Pro",
    competitorUrl: "https://www.cutout.pro/remove-background",
    heroDescription:
      "Compare Cutout.Pro and Local for teams choosing between broad online AI suites and focused local removal.",
    competitorBestFor: [
      "Teams that want many hosted AI tools in one platform",
      "Users handling mixed image/video operations in the browser",
      "Studios that value integrated online editing stacks",
    ],
    competitorWorkflow: "Hosted multi-tool platform with browser-first background removal",
    competitorPricing: "Plan and credit structure across hosted features",
    competitorAutomation: "API and app integrations in cloud stacks",
    sources: ["https://www.cutout.pro/remove-background"],
    lastReviewedAt: "2026-03-30",
  }),
  createComparePage({
    slug: "pixelcut",
    competitorName: "Pixa (formerly Pixelcut)",
    competitorUrl: "https://www.pixa.com/background-remover",
    heroDescription:
      "Compare Pixa and Local for high-volume product image teams with different deployment preferences.",
    competitorBestFor: [
      "Teams editing in mobile + browser-first environments",
      "Catalog creators needing hosted batch tools and templates",
      "Workflows anchored in online creative collaboration",
    ],
    competitorWorkflow: "Cloud and app editing flow with upload-based processing",
    competitorPricing: "Freemium and subscription approach for hosted tooling",
    competitorAutomation: "API options for platform-based workflows",
    sources: ["https://www.pixa.com/background-remover"],
    lastReviewedAt: "2026-03-30",
  }),
  createComparePage({
    slug: "fotor",
    competitorName: "Fotor",
    competitorUrl: "https://www.fotor.com/features/background-remover/",
    heroDescription:
      "Compare Fotor and Local for teams weighing broad browser design suites versus local-focused removal.",
    competitorBestFor: [
      "Users who want design templates and all-in-one web editing",
      "Teams doing mixed creative tasks beyond background removal",
      "Creators preferring browser-based workflows",
    ],
    competitorWorkflow: "Online editor suite with AI background removal module",
    competitorPricing: "Freemium plans with paid upgrade tiers",
    competitorAutomation: "Mostly editor-driven with platform feature sets",
    sources: ["https://www.fotor.com/features/background-remover/"],
    lastReviewedAt: "2026-03-30",
  }),
  createComparePage({
    slug: "pixlr",
    competitorName: "Pixlr",
    competitorUrl: "https://pixlr.com/remove-background/",
    heroDescription:
      "Compare Pixlr and Local for fast background removal when you need either browser convenience or local repeatability.",
    competitorBestFor: [
      "Designers who already run Pixlr web editors in daily workflows",
      "Teams that want quick browser cutouts with manual fine-tuning",
      "Users looking for online tools without local setup",
    ],
    competitorWorkflow: "Browser-based remove background and editor workflow",
    competitorPricing: "Free and premium tiers around web usage",
    competitorAutomation: "Batch editor tools with hosted operation",
    sources: ["https://pixlr.com/remove-background/"],
    lastReviewedAt: "2026-03-30",
  }),
  createComparePage({
    slug: "removal-ai",
    competitorName: "Removal.AI",
    competitorUrl: "https://removal.ai/",
    heroDescription:
      "Compare Removal.AI and Local for organizations selecting between hosted APIs and local app + CLI routes.",
    competitorBestFor: [
      "Teams that prioritize hosted API integrations",
      "Organizations needing browser-based background editing",
      "Users who want manual editing services alongside automation",
    ],
    competitorWorkflow: "Hosted platform with automatic online background removal",
    competitorPricing: "Hosted plans and service tiers",
    competitorAutomation: "API-first integration approach",
    sources: ["https://removal.ai/"],
    lastReviewedAt: "2026-03-30",
  }),
  createComparePage({
    slug: "clipping-magic",
    competitorName: "Clipping Magic",
    competitorUrl: "https://www.clippingmagic.com/",
    heroDescription:
      "Compare Clipping Magic and Local for teams that need either manual control in the browser or local repeatability.",
    competitorBestFor: [
      "Users who want detailed browser-side cutout controls",
      "Teams comfortable with online upload/edit/download loops",
      "Workflows focused on web editor precision tools",
    ],
    competitorWorkflow: "Web editor workflow with online cutout refinement",
    competitorPricing: "Account-based hosted usage plans",
    competitorAutomation: "Primarily web editor operations",
    sources: ["https://www.clippingmagic.com/"],
    lastReviewedAt: "2026-03-30",
  }),
  createComparePage({
    slug: "insmind",
    competitorName: "insMind",
    competitorUrl: "https://www.insmind.com/image-tools/background-remover/",
    heroDescription:
      "Compare insMind and Local when your team needs either broad online AI design tools or local-first workflows.",
    competitorBestFor: [
      "Teams that prefer multi-feature AI editing in one web app",
      "Users needing batch image edits in hosted workflows",
      "Creators combining background removal with AI design features",
    ],
    competitorWorkflow: "Online AI image editor with background removal entry points",
    competitorPricing: "Freemium and subscription hosted model",
    competitorAutomation: "Batch and editor-led cloud workflows",
    sources: ["https://www.insmind.com/image-tools/background-remover/"],
    lastReviewedAt: "2026-03-30",
  }),
];

export const COMPARE_SLUGS = COMPARE_PAGES.map((page) => page.slug);

export function getComparePageBySlug(slug: string): ComparePage | undefined {
  return COMPARE_PAGES.find((page) => page.slug === slug);
}
