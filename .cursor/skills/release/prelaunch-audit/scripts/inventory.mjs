import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const lines = [];
let failed = false;

function exists(relative) {
  try {
    return statSync(path.join(root, relative)).isFile();
  } catch {
    return false;
  }
}

function add(status, message) {
  lines.push(`- ${status}: ${message}`);
  if (status === "fail") {
    failed = true;
  }
}

const indexPath = "apps/web/index.html";
if (!exists(indexPath)) {
  add("gap", "apps/web/index.html is missing");
} else {
  const html = readFileSync(path.join(root, indexPath), "utf8");
  const title = html.match(/<title>([^<]*)<\/title>/);
  add("info", `document title is ${title?.[1] ?? "missing"}`);
  if (html.includes('rel="icon"') || html.includes("rel='icon'")) {
    add("info", "index.html links a favicon");
  } else {
    add("gap", "index.html does not link a favicon");
  }
  if (!html.includes('name="description"')) {
    add("gap", "index.html has no meta description");
  }
}

const crawlNames = ["robots.txt", "sitemap.xml", "llms.txt"];
const foundCrawl = new Map(crawlNames.map((name) => [name, []]));

function walk(relative) {
  let entries = [];
  try {
    entries = readdirSync(path.join(root, relative), { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    if (entry.name === "node_modules" || entry.name === "dist" || entry.name === ".git") {
      continue;
    }
    const next = path.join(relative, entry.name);
    if (entry.isDirectory()) {
      walk(next);
      continue;
    }
    const bucket = foundCrawl.get(entry.name);
    if (bucket) {
      bucket.push(next);
    }
  }
}

walk("apps/web");
walk("public");
for (const name of crawlNames) {
  const matches = foundCrawl.get(name) ?? [];
  if (matches.length === 0) {
    add("gap", `${name} is absent`);
  } else {
    add("info", `${name} present at ${matches.join(", ")}`);
  }
}

const router = exists("apps/web/src/router/index.ts")
  ? readFileSync(path.join(root, "apps/web/src/router/index.ts"), "utf8")
  : "";
if (router.includes("404") || router.includes("NotFound") || router.includes("not-found")) {
  add("info", "router mentions a not-found route");
} else {
  add("gap", "router has no custom not-found route");
}

const envExample = exists(".env.example")
  ? readFileSync(path.join(root, ".env.example"), "utf8")
  : "";
const privileged = ["SERVICE_ROLE", "DATABASE_URL", "RESEND", "SENTRY", "SECRET", "PASSWORD"];
const viteNames = new Set();
function collectVite(relative) {
  let text = "";
  try {
    text = readFileSync(path.join(root, relative), "utf8");
  } catch {
    return;
  }
  for (const match of text.matchAll(/VITE_[A-Z0-9_]+/g)) {
    viteNames.add(match[0]);
  }
}
collectVite(".env.example");
collectVite("apps/web/src/env.ts");
if (viteNames.size === 0) {
  add("info", "no VITE_ names found");
} else {
  add("info", `VITE_ names: ${[...viteNames].sort().join(", ")}`);
}
for (const name of viteNames) {
  if (privileged.some((part) => name.includes(part))) {
    add("fail", `${name} is a privileged client variable`);
  }
}
for (const line of envExample.split("\n")) {
  const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (!match) {
    continue;
  }
  const key = match[1] ?? "";
  const value = match[2] ?? "";
  if (value.length > 0 && privileged.some((part) => key.includes(part))) {
    add("fail", `${key} has a non-empty example value`);
  }
}

const viteConfig = exists("apps/web/vite.config.ts")
  ? readFileSync(path.join(root, "apps/web/vite.config.ts"), "utf8")
  : "";
if (viteConfig.includes("sourcemap")) {
  add("info", "vite.config.ts mentions sourcemap; confirm it is not publicly served");
} else {
  add("info", "vite.config.ts does not enable build.sourcemap");
}

process.stdout.write("# Instruction inventory\n\n");
process.stdout.write(
  "File presence is not a pass. Behavior still has to be checked against docs/quality/prelaunch-checklist.md.\n\n",
);
for (const line of lines) {
  process.stdout.write(`${line}\n`);
}
process.exit(failed ? 1 : 0);
