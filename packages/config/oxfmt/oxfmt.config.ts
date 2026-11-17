import { defineConfig } from "oxfmt";

const config = defineConfig({
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: false,
  trailingComma: "all",
  ignorePatterns: [
    "**/node_modules/**",
    "**/dist/**",
    "**/coverage/**",
    "**/.turbo/**",
    "**/.supabase/**",
    "**/pnpm-lock.yaml",
  ],
});

export default config;
