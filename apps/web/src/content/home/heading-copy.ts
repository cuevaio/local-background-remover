import type {
  HomeAutomationChatsCopyVariant,
  HomeBeforeAfterCopyVariant,
  HomeCliQuickstartCopyVariant,
  HomeFooterCopyVariant,
  HomeInputOptionsCopyVariant,
  HomePricingFaqCopyVariant,
  HomeQuoteCopyVariant,
  HomeTestimonialsCopyVariant,
  HomeWorkflowComparisonCopyVariant,
} from "@/lib/experiments/types";

export type HomePageCopy = {
  hero: {
    badge: string;
    title: string;
    description: string;
    workflowTitle: string;
    workflowDescription: string;
  };
  beforeAfter: {
    badge: string;
    title: string;
    ctaLabel: string;
    examples: Array<{
      id: string;
      title: string;
      context: string;
    }>;
  };
  inputOptions: {
    badge: string;
    title: string;
    description: string;
    options: Array<{
      title: string;
      eyebrow: string;
      description: string;
    }>;
    mediaCardTitle: string;
    mediaCardDescription: string;
    mediaBadge: string;
  };
  workflowComparison: {
    title: string;
    description: string;
    workflows: Array<{
      key: "app" | "cli" | "both";
      name: string;
      summary: string;
      badge?: string;
      bullets: string[];
      cta: string;
    }>;
  };
  cliQuickstart: {
    sectionTitle: string;
    sectionDescription: string;
    commandCardTitle: string;
    commandCardDescription: string;
    resultTitle: string;
    sliderTitle: string;
    sliderDescription: string;
  };
  automationChats: {
    badge: string;
    title: string;
    description: string;
    promptLabel: string;
    examples: Array<{
      tool: string;
      title: string;
      description: string;
    }>;
  };
  quote: {
    badge: string;
    quote: string;
    supportingLine: string;
    footerLine: string;
  };
  testimonials: {
    badge: string;
    title: string;
    description: string;
    workflowLabels: Record<string, string>;
  };
  pricingFaq: {
    sectionTitle: string;
    purchaseBadge: string;
    purchaseTitle: string;
    purchaseAlerts: Array<{
      title: string;
      description: string;
    }>;
    faqTitle: string;
    faqs: Array<{
      question: string;
      answer: string;
    }>;
  };
  stickyCta: {
    title: string;
    description: string;
  };
  footer: {
    title: string;
    description: string;
    columnTitles: {
      product: string;
      resources: string;
      company: string;
      compare: string;
    };
  };
};

const HERO_BY_VARIANT = {
  control: {
    title: "Remove backgrounds privately on your Mac.",
  },
  mac_app: {
    title: "A simple Mac app for fast, clean cutouts.",
  },
  product_photos: {
    title: "Turn rough product photos into clean listing images.",
  },
} as const;

const BEFORE_AFTER_BY_VARIANT: Record<HomeBeforeAfterCopyVariant, HomePageCopy["beforeAfter"]> = {
  control: {
    badge: "Before / after examples",
    title: "See how quickly cluttered photos become clean product images",
    ctaLabel: "See more examples",
    examples: [
      {
        id: "watch-product",
        title: "Product: ecommerce watch",
        context: "For store listings, ads, and polished product cards",
      },
      {
        id: "car-shot",
        title: "Vehicle: marketing cutout",
        context: "For launch pages, comparison graphics, and hero comps",
      },
      {
        id: "pet-portrait",
        title: "Pet: profile-ready cleanup",
        context: "For creator brands, merch, and shareable social assets",
      },
    ],
  },
  speed_examples: {
    badge: "Fast local examples",
    title: "See fast local cleanup turn rough shots into ready-to-use cutouts",
    ctaLabel: "Browse more examples",
    examples: [
      {
        id: "watch-product",
        title: "Product: listing-ready watch",
        context: "For store pages, launch assets, and polished product tiles",
      },
      {
        id: "car-shot",
        title: "Vehicle: launch-ready cutout",
        context: "For hero comps, comparison pages, and campaign mockups",
      },
      {
        id: "pet-portrait",
        title: "Pet: creator-ready asset",
        context: "For merch drops, profile art, and shareable promos",
      },
    ],
  },
  listing_outcomes: {
    badge: "Listing outcomes",
    title: "From messy originals to polished cutouts for listings, launches, and promos",
    ctaLabel: "View all examples",
    examples: [
      {
        id: "watch-product",
        title: "Product: polished listing shot",
        context: "For PDPs, paid social, and cleaner catalog assets",
      },
      {
        id: "car-shot",
        title: "Vehicle: launch campaign asset",
        context: "For compare pages, launch teasers, and promo graphics",
      },
      {
        id: "pet-portrait",
        title: "Pet: merch-ready portrait",
        context: "For creator shops, social posts, and print-ready assets",
      },
    ],
  },
};

const INPUT_OPTIONS_BY_VARIANT: Record<HomeInputOptionsCopyVariant, HomePageCopy["inputOptions"]> = {
  control: {
    badge: "Desktop app workflow",
    title: "Start from a file, a URL, or your clipboard",
    description:
      "In the macOS app, you can select a file from disk, paste an image URL, or use Cmd+V to drop an image from your clipboard. As soon as an image is added, background removal starts automatically, usually taking about 1.2 - 1.5 seconds per image. You can move through previous images in the gallery, then press Cmd+C to copy the selected result into Canva, Photoshop, Illustrator, WhatsApp, and similar tools.",
    options: [
      {
        title: "Choose a source",
        eyebrow: "File / URL / Cmd+V",
        description: "Select a file from disk, read an image from a URL, or press Cmd+V to paste an image straight into the app.",
      },
      {
        title: "Auto-remove on import",
        eyebrow: "1.2 - 1.5s",
        description: "When an image is selected, background removal starts automatically and usually finishes in about 1.2 - 1.5 seconds per image.",
      },
      {
        title: "Move through earlier results",
        eyebrow: "Gallery history",
        description: "Navigate previous images in the gallery to review older cutouts without re-importing them.",
      },
      {
        title: "Copy into the next tool",
        eyebrow: "Cmd+C",
        description: "Press Cmd+C in the app and the selected processed image is copied to the clipboard, ready for Canva, Photoshop, Illustrator, WhatsApp, and more.",
      },
    ],
    mediaCardTitle: "Input options in action",
    mediaCardDescription: "See the local desktop flow: import, process automatically, browse the gallery, and copy the selected cutout onward.",
    mediaBadge: "Local-first app",
  },
  import_flow: {
    badge: "Fast import flow",
    title: "Import from anywhere, then keep the cleanup moving",
    description:
      "Use the Mac app to pull in a file from disk, paste an image URL, or drop in something from your clipboard with Cmd+V. Cleanup starts as soon as the image lands, then you can move through earlier results and copy the best cutout into your next tool without redoing the work.",
    options: [
      {
        title: "Bring in the next image",
        eyebrow: "File / URL / Cmd+V",
        description: "Start from local files, pasted URLs, or clipboard images without switching tools first.",
      },
      {
        title: "Process right away",
        eyebrow: "Around 1.2 - 1.5s",
        description: "Background removal starts on import and usually finishes in roughly 1.2 - 1.5 seconds per image.",
      },
      {
        title: "Review recent cutouts",
        eyebrow: "Gallery history",
        description: "Step back through earlier processed images whenever you want to compare or reuse prior results.",
      },
      {
        title: "Hand off the result",
        eyebrow: "Cmd+C",
        description: "Copy the selected PNG straight into Canva, Photoshop, Illustrator, WhatsApp, and similar downstream tools.",
      },
    ],
    mediaCardTitle: "The import-to-export flow",
    mediaCardDescription: "Watch the local app pull in an image, process it automatically, surface earlier results, and hand the selected cutout to the next step.",
    mediaBadge: "Mac workflow",
  },
  handoff_ready: {
    badge: "Handoff-ready",
    title: "Bring in the asset, clean it up, and hand it off without extra steps",
    description:
      "This flow keeps the work local from import through export. Pull in a file, URL, or clipboard image, let the app process it, then copy the result into Canva, Photoshop, Illustrator, or wherever it needs to go next.",
    options: [
      {
        title: "Import the next asset",
        eyebrow: "Local or pasted",
        description: "Start with files on disk, pasted URLs, or something already in your clipboard.",
      },
      {
        title: "Watch cleanup finish fast",
        eyebrow: "Fast local run",
        description: "Processing usually completes in around 1.2 - 1.5 seconds per image once it is imported.",
      },
      {
        title: "Review before exporting",
        eyebrow: "Previous results",
        description: "Step through earlier cutouts and spot-check what you want to keep before handing off the output.",
      },
      {
        title: "Paste into the next app",
        eyebrow: "Cmd+C",
        description: "Copy the selected cutout directly into the next design or production tool without a detour.",
      },
    ],
    mediaCardTitle: "From import to handoff",
    mediaCardDescription: "See how the local app keeps the path from source asset to downstream tool short and predictable.",
    mediaBadge: "Ready to paste",
  },
};

const WORKFLOW_COMPARISON_BY_VARIANT: Record<HomeWorkflowComparisonCopyVariant, HomePageCopy["workflowComparison"]> = {
  control: {
    title: "Choose the version that fits how you work",
    description: "The app is the easiest place to start. The CLI is there if you want scripts, batches, or coding-agent automation.",
    workflows: [
      {
        key: "app",
        name: "Desktop App",
        summary: "Best for most people who want a simple Mac app for product photos, portraits, and quick edits.",
        bullets: [
          "Simple app workflow on your Mac",
          "Great for visual checks before export",
          "Best choice for everyday image cleanup",
        ],
        cta: "See App plan",
      },
      {
        key: "cli",
        name: "CLI",
        summary: "For developers who want scripts, batches, and coding-agent automation.",
        bullets: [
          "Runs from the command line",
          "Great for repeat batches and scripts",
          "Works well with coding agents",
        ],
        cta: "See CLI plan",
      },
      {
        key: "both",
        name: "App + CLI",
        summary: "For teams or power users who want both a simple app and command-line automation.",
        badge: "Best value",
        bullets: [
          "Includes the app and the CLI",
          "Useful when you want visual checks plus batch jobs",
          "Best if you know you will use both",
        ],
        cta: "See Bundle",
      },
    ],
  },
  workflow_fit: {
    title: "Pick the workflow that matches your cleanup pace",
    description: "Start with the app for everyday image work, then layer in the CLI when you want repeatable local automation.",
    workflows: [
      {
        key: "app",
        name: "Desktop App",
        summary: "The quickest fit for people who want local cleanup, visual review, and easy exports on a Mac.",
        bullets: [
          "Best for visual review before shipping assets",
          "Simple local workflow with minimal setup",
          "Strong default for daily cleanup work",
        ],
        cta: "Choose App",
      },
      {
        key: "cli",
        name: "CLI",
        summary: "Built for developers and operators who want batch jobs, scripts, and agent-friendly local commands.",
        bullets: [
          "Fits scripts, batches, and repeat jobs",
          "Works well in command-line workflows",
          "Ready for coding-agent automation",
        ],
        cta: "Choose CLI",
      },
      {
        key: "both",
        name: "App + CLI",
        summary: "The hybrid setup for people who want visual confidence in the app and repeatability from the command line.",
        badge: "Most flexible",
        bullets: [
          "Blend visual checks with automated runs",
          "Useful when one workflow is not enough",
          "Strong fit for teams and power users",
        ],
        cta: "Choose Bundle",
      },
    ],
  },
  role_based: {
    title: "Choose the setup that matches your role",
    description: "Use the app for hands-on cleanup, the CLI for developer workflows, or both if your team needs review plus automation.",
    workflows: [
      {
        key: "app",
        name: "For creators",
        summary: "A Mac app workflow for designers, marketers, and founders who want to clean up assets visually and move on.",
        bullets: [
          "Best for manual review and quick fixes",
          "Fits product photos, portraits, and marketing assets",
          "Low-friction setup for solo users",
        ],
        cta: "See App plan",
      },
      {
        key: "cli",
        name: "For developers",
        summary: "A command-line workflow for engineers, operators, and anyone who wants repeatable local jobs.",
        bullets: [
          "Fits scripts, terminal workflows, and agents",
          "Good for repeat batches and predictable output",
          "Easy to slot into existing automation",
        ],
        cta: "See CLI plan",
      },
      {
        key: "both",
        name: "For hybrid teams",
        summary: "A combined setup for teams that want visual review in the app and repeatability from the CLI.",
        badge: "Team fit",
        bullets: [
          "Use the app for review and approval",
          "Use the CLI for batches and automation",
          "Best when multiple people touch the workflow",
        ],
        cta: "See Bundle",
      },
    ],
  },
};

const CLI_QUICKSTART_BY_VARIANT: Record<HomeCliQuickstartCopyVariant, HomePageCopy["cliQuickstart"]> = {
  control: {
    sectionTitle: "Optional CLI for scripts and coding agents",
    sectionDescription: "Most people should start with the app. If you also want local automation, the CLI works with scripts and coding agents.",
    commandCardTitle: "Example CLI command",
    commandCardDescription: "A quick example for developers who want a machine-readable local workflow.",
    resultTitle: "What comes back",
    sliderTitle: "See the result",
    sliderDescription: "Drag the slider to compare the original photo with the generated PNG.",
  },
  local_json: {
    sectionTitle: "Need local automation? The CLI returns clean machine-readable output",
    sectionDescription: "Start with the app if you want the easiest workflow. When you need scripts, agents, or repeatable batches, the CLI gives you a local JSON-friendly interface.",
    commandCardTitle: "Local CLI example",
    commandCardDescription: "One command for developers who want a predictable local workflow and machine-readable output.",
    resultTitle: "Example JSON response",
    sliderTitle: "Compare the generated PNG",
    sliderDescription: "Drag the slider to see the original image against the cleaned local PNG output.",
  },
  agent_terminal: {
    sectionTitle: "For terminals and coding agents, the local CLI keeps the workflow scriptable",
    sectionDescription: "Start with the app for hands-on cleanup. Reach for the CLI when you want agent prompts, terminal commands, or repeatable jobs that stay local.",
    commandCardTitle: "Agent-friendly CLI command",
    commandCardDescription: "A terminal example for workflows that need local commands, structured output, and repeatable runs.",
    resultTitle: "Machine-readable result",
    sliderTitle: "Compare the terminal output result",
    sliderDescription: "Drag the slider to compare the source asset against the cleaned PNG produced by the local command.",
  },
};

const AUTOMATION_CHATS_BY_VARIANT: Record<HomeAutomationChatsCopyVariant, HomePageCopy["automationChats"]> = {
  control: {
    badge: "Advanced automation",
    title: "Need scripts or coding agents? The CLI is ready.",
    description: "Most buyers should start with the app. If you also want repeat batches, scripts, or coding-agent workflows, the rmbg CLI gives you a local command-line option that fits automated image cleanup.",
    promptLabel: "Prompt",
    examples: [
      {
        tool: "Claude Code",
        title: "Claude Code",
        description: "Same prompt, local CLI execution",
      },
      {
        tool: "OpenCode",
        title: "OpenCode",
        description: "Same prompt, local CLI execution",
      },
    ],
  },
  agent_handoff: {
    badge: "Agent handoff",
    title: "Hand the batch to your coding agent, keep the cleanup local",
    description: "The app is still the easiest entry point. When you want repeatable prompts, agent-driven runs, or scripted batches, the rmbg CLI gives your local workflow a clean handoff point.",
    promptLabel: "Prompt used",
    examples: [
      {
        tool: "Claude Code",
        title: "Claude Code handoff",
        description: "Same local prompt, same CLI workflow",
      },
      {
        tool: "OpenCode",
        title: "OpenCode handoff",
        description: "Same local prompt, same CLI workflow",
      },
    ],
  },
  repeat_batches: {
    badge: "Repeat batches",
    title: "Use the CLI when the same cleanup job needs to run again and again",
    description: "The app handles one-off visual cleanup well. For recurring jobs, prompts, or repeat runs, the CLI gives you a local workflow that is easier to repeat and automate.",
    promptLabel: "Batch prompt",
    examples: [
      {
        tool: "Claude Code",
        title: "Claude Code batch run",
        description: "Repeatable prompt with local CLI output",
      },
      {
        tool: "OpenCode",
        title: "OpenCode batch run",
        description: "Repeatable prompt with local CLI output",
      },
    ],
  },
};

const QUOTE_BY_VARIANT: Record<HomeQuoteCopyVariant, HomePageCopy["quote"]> = {
  control: {
    badge: "A clearer workflow",
    quote: "Clean edges are easy.\nClean handoffs win.",
    supportingLine: "Local Background Remover combines desktop review, command-line speed, and offline reliability in one lean stack.",
    footerLine: "Fast. Private. Repeatable. Built for people who care about craft.",
  },
  craft_handoff: {
    badge: "Craft and handoff",
    quote: "The cutout matters.\nThe handoff matters more.",
    supportingLine: "Local Background Remover gives you desktop review, command-line repeatability, and offline reliability in one tighter workflow.",
    footerLine: "Clean inputs. Clean outputs. Built for teams that sweat the details.",
  },
  private_pipeline: {
    badge: "Private pipeline",
    quote: "Keep the cleanup local.\nKeep the workflow moving.",
    supportingLine: "Local Background Remover keeps review, repeatability, and offline work in one private on-device pipeline.",
    footerLine: "Private. Predictable. Built for workflows that should stay on your machine.",
  },
};

const TESTIMONIALS_BY_VARIANT: Record<HomeTestimonialsCopyVariant, HomePageCopy["testimonials"]> = {
  control: {
    badge: "Customer stories",
    title: "Trusted by makers who ship every week",
    description: "Independent designers, founders, and builders using local background removal for daily creative output.",
    workflowLabels: {},
  },
  weekly_shippers: {
    badge: "Weekly shippers",
    title: "Used by builders shipping assets every single week",
    description: "Founders, designers, and indie operators using local cleanup to keep launches, client work, and creative output moving.",
    workflowLabels: {
      "Desktop polish": "Desktop momentum",
      "CLI shipping": "CLI shipping",
      "Offline workflow": "Offline momentum",
      "Weekly batches": "Weekly batches",
      "Fast setup": "Fast setup",
      "Hybrid flow": "Hybrid workflow",
    },
  },
  hybrid_teams: {
    badge: "Hybrid teams",
    title: "Teams using the app and CLI together to keep image work moving",
    description: "Examples from founders, designers, and indie teams combining visual review with local automation.",
    workflowLabels: {
      "Desktop polish": "Visual review",
      "CLI shipping": "CLI workflow",
      "Offline workflow": "Offline edits",
      "Weekly batches": "Batch ops",
      "Fast setup": "Quick onboarding",
      "Hybrid flow": "App + CLI",
    },
  },
};

const PRICING_FAQ_BY_VARIANT: Record<HomePricingFaqCopyVariant, HomePageCopy["pricingFaq"]> = {
  control: {
    sectionTitle: "Questions before checkout",
    purchaseBadge: "Purchase confidence",
    purchaseTitle: "Clear purchase terms",
    purchaseAlerts: [
      {
        title: "One-time purchase",
        description: "No recurring subscription for core usage.",
      },
      {
        title: "Flexible workflow choices",
        description: "Choose the app, the CLI, or both based on how simple or automated you want your workflow to be.",
      },
      {
        title: "Reliable in day-to-day use",
        description: "Keep processing without needing a constant internet connection.",
      },
    ],
    faqTitle: "Frequently asked questions",
    faqs: [
      {
        question: "Are downloads public?",
        answer: "Yes. You can install anytime. Most buyers should choose a plan first, then come back here for install steps.",
      },
      {
        question: "What does App + CLI include?",
        answer: "The bundle includes the Mac app plus the CLI in one purchase.",
      },
      {
        question: "Can I keep working offline?",
        answer: "Yes. After activation, you can keep processing even when your internet is unstable.",
      },
      {
        question: "Can I start with one plan and upgrade later?",
        answer: "Yes. Start with the app or the CLI, then add the other later if you need both.",
      },
    ],
  },
  buying_clarity: {
    sectionTitle: "Buying questions, answered clearly",
    purchaseBadge: "Buying clarity",
    purchaseTitle: "Know what you are paying for",
    purchaseAlerts: [
      {
        title: "Pay once",
        description: "Core usage is a one-time purchase, not a recurring subscription.",
      },
      {
        title: "Pick the right workflow",
        description: "Choose the app, the CLI, or the bundle based on whether you want simplicity, automation, or both.",
      },
      {
        title: "Keep working offline",
        description: "After activation, you can continue processing without a constant internet connection.",
      },
    ],
    faqTitle: "Common buying questions",
    faqs: [
      {
        question: "Can anyone download the installer?",
        answer: "Yes. Installers are public. Most buyers compare plans first, then come back for install steps.",
      },
      {
        question: "What is included in App + CLI?",
        answer: "It includes both the Mac app and the CLI in a single purchase.",
      },
      {
        question: "Will it still work offline?",
        answer: "Yes. After activation, you can keep processing even when your internet connection drops.",
      },
      {
        question: "Can I upgrade later?",
        answer: "Yes. Start with the app or the CLI, then add the other later if your workflow grows.",
      },
    ],
  },
  plan_fit: {
    sectionTitle: "Figure out which plan fits before you check out",
    purchaseBadge: "Plan fit",
    purchaseTitle: "Pick the right setup for your workflow",
    purchaseAlerts: [
      {
        title: "App for simple visual work",
        description: "A good fit when you want the easiest local workflow for product photos and quick edits.",
      },
      {
        title: "CLI for repeatable automation",
        description: "A better fit when you need scripts, batches, or coding-agent workflows.",
      },
      {
        title: "Bundle for both",
        description: "Choose the bundle when you want visual review in the app and repeatability from the CLI.",
      },
    ],
    faqTitle: "Plan choice questions",
    faqs: [
      {
        question: "Should I pick App or CLI first?",
        answer: "Start with the app for simple manual cleanup, or choose the CLI if scripts and batch jobs are the primary need.",
      },
      {
        question: "When is App + CLI worth it?",
        answer: "It is a good fit when you want both hands-on visual review and automated local runs.",
      },
      {
        question: "Do installs stay public?",
        answer: "Yes. The installer is public even though paid features only unlock after activation.",
      },
      {
        question: "Can I upgrade later if my workflow changes?",
        answer: "Yes. You can start smaller and add the other workflow later when it becomes useful.",
      },
    ],
  },
};

const STICKY_CTA_BY_VARIANT = {
  control: {
    title: "Ready to clean up images without upload-first tools?",
    description: "Start with pricing, then install when you are ready.",
  },
  plans_first: {
    title: "Ready for a local background remover that fits your workflow?",
    description: "Compare plans first, then install when you are ready.",
  },
  pricing_docs: {
    title: "Ready to price the app or wire up the CLI?",
    description: "Start with pricing, then jump into docs or install steps when you are ready.",
  },
} as const;

const FOOTER_BY_VARIANT: Record<HomeFooterCopyVariant, HomePageCopy["footer"]> = {
  control: {
    title: "Clean backgrounds privately. Pay once.",
    description: "A Mac app for everyday image cleanup, plus an optional CLI for scripts and coding agents.",
    columnTitles: {
      product: "Product",
      resources: "Resources",
      company: "Company",
      compare: "Compare",
    },
  },
  private_pay_once: {
    title: "Keep background cleanup private. Buy it once.",
    description: "Use the Mac app for everyday cleanup, then reach for the CLI when you want local scripts and coding-agent workflows.",
    columnTitles: {
      product: "Use the product",
      resources: "Learn the workflow",
      company: "About the maker",
      compare: "Compare options",
    },
  },
  mac_to_cli: {
    title: "Start on your Mac, scale up with the CLI when you need it",
    description: "Use the app for everyday cleanup, then bring in the CLI when scripts, agents, or repeat batches become part of the workflow.",
    columnTitles: {
      product: "Start here",
      resources: "Learn and automate",
      company: "Who built it",
      compare: "Compare workflows",
    },
  },
};

export type HomeHeadingCopyAssignments = {
  homeHeroHeadline: keyof typeof HERO_BY_VARIANT;
  stickyCtaCopy: keyof typeof STICKY_CTA_BY_VARIANT;
  homeBeforeAfterCopy: HomeBeforeAfterCopyVariant;
  homeInputOptionsCopy: HomeInputOptionsCopyVariant;
  homeWorkflowComparisonCopy: HomeWorkflowComparisonCopyVariant;
  homeCliQuickstartCopy: HomeCliQuickstartCopyVariant;
  homeAutomationChatsCopy: HomeAutomationChatsCopyVariant;
  homeQuoteCopy: HomeQuoteCopyVariant;
  homeTestimonialsCopy: HomeTestimonialsCopyVariant;
  homePricingFaqCopy: HomePricingFaqCopyVariant;
  homeFooterCopy: HomeFooterCopyVariant;
};

export function getHomePageCopy(assignments: HomeHeadingCopyAssignments): HomePageCopy {
  const cliQuickstart = CLI_QUICKSTART_BY_VARIANT[assignments.homeCliQuickstartCopy];

  return {
    hero: {
      badge: "Local and private",
      title: HERO_BY_VARIANT[assignments.homeHeroHeadline].title,
      description:
        "Clean up product photos, portraits, and marketing images without upload-first tools. Start with the Mac app, and use the CLI only if you want advanced automation.",
      workflowTitle: WORKFLOW_COMPARISON_BY_VARIANT[assignments.homeWorkflowComparisonCopy].title,
      workflowDescription:
        WORKFLOW_COMPARISON_BY_VARIANT[assignments.homeWorkflowComparisonCopy].description,
    },
    beforeAfter: BEFORE_AFTER_BY_VARIANT[assignments.homeBeforeAfterCopy],
    inputOptions: INPUT_OPTIONS_BY_VARIANT[assignments.homeInputOptionsCopy],
    workflowComparison: WORKFLOW_COMPARISON_BY_VARIANT[assignments.homeWorkflowComparisonCopy],
    cliQuickstart,
    automationChats: AUTOMATION_CHATS_BY_VARIANT[assignments.homeAutomationChatsCopy],
    quote: QUOTE_BY_VARIANT[assignments.homeQuoteCopy],
    testimonials: TESTIMONIALS_BY_VARIANT[assignments.homeTestimonialsCopy],
    pricingFaq: PRICING_FAQ_BY_VARIANT[assignments.homePricingFaqCopy],
    stickyCta: STICKY_CTA_BY_VARIANT[assignments.stickyCtaCopy],
    footer: FOOTER_BY_VARIANT[assignments.homeFooterCopy],
  };
}
