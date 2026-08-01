export type ModuleColor = "pink" | "amber" | "blue" | "green" | "violet" | "purple";

export interface ModuleDef {
  slug: string;
  name: string;
  tagline: string;
  color: ModuleColor;
  icon: string;
  description: string;
  widgets: string[];
}

export const modules: ModuleDef[] = [
  {
    slug: "marketing-suite",
    name: "Marketing Suite",
    tagline: "Grow. Engage. Convert.",
    color: "pink",
    icon: "📣",
    description:
      "Campaign planning, audience growth, and social strategy for the Luh Gerald brand.",
    widgets: ["Active campaigns", "Audience growth", "Content calendar", "Ad spend"],
  },
  {
    slug: "content-studio",
    name: "Content Studio",
    tagline: "Create. Edit. Publish.",
    color: "amber",
    icon: "🎬",
    description: "Scripts, drafts, edits, and everything waiting to publish.",
    widgets: ["Drafts in progress", "Scheduled posts", "Published this week", "Editing queue"],
  },
  {
    slug: "dev-bay",
    name: "Dev Bay",
    tagline: "Code. Build. Automate.",
    color: "blue",
    icon: "🛠️",
    description: "Tools, automations, and technical builds that keep the ecosystem running.",
    widgets: ["Active builds", "Automations running", "Open issues", "Deploys this week"],
  },
  {
    slug: "operations-hub",
    name: "Operations Hub",
    tagline: "Workflows. Systems. Automate.",
    color: "green",
    icon: "⚙️",
    description: "Task tracking, workflows, and SOPs for day-to-day operations.",
    widgets: ["Open tasks", "Workflows active", "SOPs documented", "Blockers"],
  },
  {
    slug: "finance-office",
    name: "Finance Office",
    tagline: "Track. Analyze. Optimize.",
    color: "amber",
    icon: "💰",
    description: "Budgets, pricing, and revenue tracking for the business.",
    widgets: ["Revenue this month", "Expenses", "Pricing experiments", "Runway"],
  },
  {
    slug: "research-lab",
    name: "Research Lab",
    tagline: "Discover. Learn. Innovate.",
    color: "violet",
    icon: "🔬",
    description: "Market research, trend tracking, and experiments.",
    widgets: ["Trends tracked", "Experiments running", "Reports drafted", "Ideas backlog"],
  },
];

export function getModule(slug: string): ModuleDef | undefined {
  return modules.find((m) => m.slug === slug);
}
