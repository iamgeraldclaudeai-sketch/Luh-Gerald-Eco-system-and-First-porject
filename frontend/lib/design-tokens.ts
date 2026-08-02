// Single source of truth for the Eco System's neon-command-center palette.
// tailwind.config.ts reads these so class names and raw values never drift apart.
export const colors = {
  primary: "#7C5CFF",
  accent: "#00E6A8",
  bg: "#0B0F1A",
  panel: "rgba(255, 255, 255, 0.03)",
} as const;

export type DesignTokenColor = keyof typeof colors;
