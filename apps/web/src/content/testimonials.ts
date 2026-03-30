export type LandingTestimonial = {
  id: string;
  quote: string;
  author: string;
  role: string;
  company: string;
  avatarUrl: string;
  workflow: string;
};

export const LANDING_TESTIMONIALS: LandingTestimonial[] = [
  {
    id: "elena",
    quote:
      "The app makes QA rounds way faster. We no longer bounce between upload tools, folders, and manual exports.",
    author: "Elena Morin",
    role: "Operations Lead",
    company: "Northstar Studio",
    avatarUrl: "https://i.pravatar.cc/140?img=31",
    workflow: "Desktop review",
  },
  {
    id: "marco",
    quote:
      "We replaced a brittle script chain with one reliable command. New teammates can run batches on day one.",
    author: "Marco Lin",
    role: "Platform Engineer",
    company: "Launchlane",
    avatarUrl: "https://i.pravatar.cc/140?img=59",
    workflow: "CLI automation",
  },
  {
    id: "priya",
    quote:
      "Offline after activation is huge for our field shoots. We finish edits on-site without waiting for network access.",
    author: "Priya Shah",
    role: "Founder",
    company: "Verde Commerce",
    avatarUrl: "https://i.pravatar.cc/140?img=47",
    workflow: "Offline workflow",
  },
  {
    id: "dan",
    quote:
      "Batch jobs are predictable now. We can estimate turnaround and hit launch windows without fire drills.",
    author: "Dan Wilson",
    role: "Creative Ops",
    company: "Atlas Creative",
    avatarUrl: "https://i.pravatar.cc/140?img=12",
    workflow: "Daily batches",
  },
  {
    id: "maya",
    quote:
      "The split between app and CLI keys is clear. Procurement and technical onboarding are finally simple.",
    author: "Maya Patel",
    role: "Program Manager",
    company: "Bright SKU Co.",
    avatarUrl: "https://i.pravatar.cc/140?img=45",
    workflow: "Team onboarding",
  },
  {
    id: "rui",
    quote:
      "Our pipeline is cleaner: generate assets with CLI, spot-check in app, ship with confidence.",
    author: "Rui Alvarez",
    role: "Design Systems",
    company: "Pixel Harbor",
    avatarUrl: "https://i.pravatar.cc/140?img=22",
    workflow: "Hybrid flow",
  },
];
