import { describe, expect, it } from "vitest";
import { colors } from "./design-tokens";

describe("design tokens", () => {
  it("matches the spec'd brand palette exactly", () => {
    expect(colors).toEqual({
      primary: "#7C5CFF",
      accent: "#00E6A8",
      bg: "#0B0F1A",
      panel: "rgba(255, 255, 255, 0.03)",
    });
  });
});
