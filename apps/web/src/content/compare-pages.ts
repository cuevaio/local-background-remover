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
      "Private local processing on your device",
      "Mac app first, CLI optional",
      `Quick fit check vs ${competitorName}`,
    ],
    seoTitle: `${competitorName} Alternative for Private Local Background Removal`,
    seoDescription: `Compare Local Background Remover with ${competitorName} for private local background removal on Mac, one-time pricing, and optional CLI automation.`,
    switchQuote: {
      quote: `I still use ${competitorName} for occasional browser edits, but Local is my default for repeatable shipping where privacy and reliability matter most.`,
      source: "Workflow feedback from an indie ecommerce builder",
    },
    localBestFor: [
      "People who want background removal on their own Mac",
      "Teams that want the app first and optional CLI automation later",
      "One-time pricing over recurring seats",
    ],
    competitorBestFor,
    comparisonRows: [
      {
        feature: "Processing workflow",
        local: "Runs directly on your device",
        competitor: competitorWorkflow,
      },
      {
        feature: "Pricing model",
        local: "One-time App, CLI, or bundle plans",
        competitor: competitorPricing,
      },
      {
        feature: "Offline behavior",
        local: "Keeps working even with unstable internet",
        competitor: "Commonly browser-first with online tool flows",
      },
      {
        feature: "Automation options",
        local: "Desktop app plus command-line tool for repeat workflows",
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
          "If you need local processing, repeatable CLI jobs, and one-time plans, Local is built for that path.",
      },
      {
        question: `When is ${competitorName} a better fit?`,
        answer:
          "If you prefer browser-native collaboration, template-heavy editing suites, or existing vendor ecosystems, that can be a better match.",
      },
      {
        question: "Do I need both app and CLI keys for desktop processing?",
        answer:
          "If you buy the App + CLI bundle, activate both parts to use the full workflow.",
      },
      {
        question: "Can I test Local before purchasing?",
        answer:
          "Yes. You can install anytime, but pricing is the best place to choose the right plan before you start.",
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
      "Compare remove.bg and Local for people deciding between browser uploads and local app + CLI execution.",
    competitorBestFor: [
      "Quick browser removals across many user profiles",
      "People already using remove.bg integrations and API credits",
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
      "Compare Photoroom and Local when you need product-photo speed but different control models.",
    competitorBestFor: [
      "Marketplace sellers focused on browser/mobile creative suites",
      "Users using built-in product staging and template tooling",
      "Studios running cloud-first catalog production",
    ],
    competitorWorkflow: "Web and mobile editing suite centered on hosted assets",
    competitorPricing: "Subscription tiers for creative and collaborative tooling",
    competitorAutomation: "Batch and API options in hosted pipelines",
    sources: ["https://www.photoroom.com/tools/background-remover"],
    lastReviewedAt: "2026-03-30",
  }),
  createComparePage({
    slug: "clipdrop",
    competitorName: "Clipdrop",
    competitorUrl: "https://clipdrop.co/remove-background",
    heroDescription:
      "Compare Clipdrop and Local for builders balancing fast web AI tooling versus local workflow control.",
    competitorBestFor: [
      "Users that want one-click web tools alongside other AI effects",
      "Creators who switch often between multiple online image tools",
      "Workflows centered around hosted generation and editing",
    ],
    competitorWorkflow: "Hosted AI toolset with browser-driven background removal",
    competitorPricing: "Hosted plan model tied to AI tool usage",
    competitorAutomation: "API paths for cloud-centric workflows",
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
      "Users using Slazzer's web flow and ecosystem integrations",
      "Users who prefer cloud processing and hosted APIs",
      "Studios standardizing on browser-first tooling",
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
      "Ecommerce sellers preferring browser and hosted batch tools",
      "Users who want all editing in a single online interface",
      "Builders using API-backed cloud image workflows",
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
      "Compare Cutout.Pro and Local for people choosing between broad online AI suites and focused local removal.",
    competitorBestFor: [
      "Users that want many hosted AI tools in one platform",
      "Users handling mixed image/video operations in the browser",
      "Studios that value integrated online editing suites",
    ],
    competitorWorkflow: "Hosted multi-tool platform with browser-first background removal",
    competitorPricing: "Plan and credit structure across hosted features",
    competitorAutomation: "API and app integrations in cloud suites",
    sources: ["https://www.cutout.pro/remove-background"],
    lastReviewedAt: "2026-03-30",
  }),
  createComparePage({
    slug: "pixelcut",
    competitorName: "Pixa (formerly Pixelcut)",
    competitorUrl: "https://www.pixa.com/background-remover",
    heroDescription:
      "Compare Pixa and Local for high-volume product image builders with different deployment preferences.",
    competitorBestFor: [
      "People editing in mobile + browser-first environments",
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
      "Compare Fotor and Local for people weighing broad browser design suites versus local-focused removal.",
    competitorBestFor: [
      "Users who want design templates and all-in-one web editing",
      "People doing mixed creative tasks beyond background removal",
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
      "People that want quick browser cutouts with manual fine-tuning",
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
      "Compare Removal.AI and Local for builders selecting between hosted APIs and local app + CLI routes.",
    competitorBestFor: [
      "Builders that prioritize hosted API integrations",
      "Businesses needing browser-based background editing",
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
      "Compare Clipping Magic and Local for people who need either manual control in the browser or local repeatability.",
    competitorBestFor: [
      "Users who want detailed browser-side cutout controls",
      "People comfortable with online upload/edit/download loops",
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
      "Compare insMind and Local when you need either broad online AI design tools or local-first workflows.",
    competitorBestFor: [
      "Users who prefer multi-feature AI editing in one web app",
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
