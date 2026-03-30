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
      "The app makes client polish rounds way faster. I no longer bounce between upload tools, folders, and manual exports.",
    author: "Elena Morin",
    role: "Solo Brand Designer",
    company: "Northstar Studio",
    avatarUrl: "https://i.pravatar.cc/140?img=31",
    workflow: "Desktop polish",
  },
  {
    id: "marco",
    quote:
      "I replaced a brittle script chain with one reliable command. Batch exports are finally predictable.",
    author: "Marco Lin",
    role: "Indie Hacker",
    company: "Launchlane Labs",
    avatarUrl: "https://i.pravatar.cc/140?img=59",
    workflow: "CLI shipping",
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
      "Batch jobs are predictable now. I can estimate turnaround and hit launch windows without fire drills.",
    author: "Dan Wilson",
    role: "Freelance Creative",
    company: "Atlas Studio",
    avatarUrl: "https://i.pravatar.cc/140?img=12",
    workflow: "Weekly batches",
  },
  {
    id: "maya",
    quote:
      "The split between app and CLI keys is clear. Buying once and getting to work feels refreshingly simple.",
    author: "Maya Patel",
    role: "Bootstrapped Founder",
    company: "Bright SKU",
    avatarUrl: "https://i.pravatar.cc/140?img=45",
    workflow: "Fast setup",
  },
  {
    id: "rui",
    quote:
      "My pipeline is cleaner: generate assets with CLI, spot-check in app, and ship with confidence.",
    author: "Rui Alvarez",
    role: "Product Designer",
    company: "Pixel Harbor",
    avatarUrl: "https://i.pravatar.cc/140?img=22",
    workflow: "Hybrid flow",
  },
];
