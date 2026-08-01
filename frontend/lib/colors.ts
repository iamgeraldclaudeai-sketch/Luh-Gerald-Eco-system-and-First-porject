import { ModuleColor } from "./modules";

export const colorClasses: Record<
  ModuleColor,
  { text: string; border: string; hoverBorder: string; bg: string }
> = {
  pink: {
    text: "text-pink-400",
    border: "border-pink-500/40",
    hoverBorder: "hover:border-pink-400",
    bg: "bg-pink-500/10",
  },
  amber: {
    text: "text-amber-400",
    border: "border-amber-500/40",
    hoverBorder: "hover:border-amber-400",
    bg: "bg-amber-500/10",
  },
  blue: {
    text: "text-sky-400",
    border: "border-sky-500/40",
    hoverBorder: "hover:border-sky-400",
    bg: "bg-sky-500/10",
  },
  green: {
    text: "text-emerald-400",
    border: "border-emerald-500/40",
    hoverBorder: "hover:border-emerald-400",
    bg: "bg-emerald-500/10",
  },
  violet: {
    text: "text-violet-400",
    border: "border-violet-500/40",
    hoverBorder: "hover:border-violet-400",
    bg: "bg-violet-500/10",
  },
  purple: {
    text: "text-purple-400",
    border: "border-purple-500/40",
    hoverBorder: "hover:border-purple-400",
    bg: "bg-purple-500/10",
  },
};
