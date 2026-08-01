import type { Config } from "tailwindcss";
import { colors as tokens } from "./lib/design-tokens";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: tokens.primary,
        accent: tokens.accent,
        bg: tokens.bg,
        panel: tokens.panel,
        space: {
          950: "#05030f",
          900: "#0b0620",
          800: "#120b33",
        },
        neon: {
          purple: "#a855f7",
          pink: "#ec4899",
          blue: "#38bdf8",
          green: "#34d399",
          amber: "#fbbf24",
          violet: "#8b5cf6",
        },
      },
      fontFamily: {
        display: ["ui-monospace", "SFMono-Regular", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
