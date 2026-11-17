import { defineConfig, type OxlintConfig } from "oxlint";
import shared from "@velora/config/oxlint/oxlintrc.json" with { type: "json" };

function isOxlintConfig(value: unknown): value is OxlintConfig {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  return "plugins" in value && "categories" in value && "rules" in value;
}

if (!isOxlintConfig(shared)) {
  throw new Error("Invalid shared Oxlint config");
}

export default defineConfig({
  extends: [shared],
  options: {
    denyWarnings: true,
    typeAware: true,
  },
});
