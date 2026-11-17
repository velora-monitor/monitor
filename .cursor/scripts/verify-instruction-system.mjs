import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const errors = [];
const notes = [];

const rules = [
  ["architecture.mdc", "always"],
  ["security-baseline.mdc", "always"],
  ["typescript.mdc", "files"],
  ["vue-frontend.mdc", "files"],
  ["design-system.mdc", "files"],
  ["motion.mdc", "files"],
  ["accessibility.mdc", "files"],
  ["responsive.mdc", "files"],
  ["ux.mdc", "files"],
  ["api.mdc", "files"],
  ["database.mdc", "files"],
  ["worker.mdc", "files"],
  ["observability.mdc", "files"],
  ["testing.mdc", "files"],
  ["seo.mdc", "intelligent"],
  ["website-quality.mdc", "intelligent"],
  ["performance.mdc", "intelligent"],
  ["privacy.mdc", "intelligent"],
];

const skills = [
  "ui-design-review",
  "design-system-maintenance",
  "responsive-audit",
  "accessibility-audit",
  "animation-review",
  "api-development",
  "database-development",
  "testing-workflow",
  "debugging-workflow",
  "performance-audit",
  "security-audit",
  "tenant-isolation-audit",
  "observability-domain-review",
  "seo-audit",
  "website-quality-audit",
  "prelaunch-audit",
];

const anchors = [
  "oklch(21.08% 0.00782 285.71)",
  "oklch(54.43% 0.25945 287.45)",
  "oklch(89.60% 0.22671 125.54)",
];

function fail(message) {
  errors.push(message);
}

function read(relative) {
  return readFileSync(path.join(root, relative), "utf8");
}

function exists(relative) {
  try {
    statSync(path.join(root, relative));
    return true;
  } catch {
    return false;
  }
}

function frontmatter(text, file) {
  if (!text.startsWith("---\n")) {
    fail(`${file} is missing frontmatter`);
    return null;
  }
  const end = text.indexOf("\n---\n", 4);
  if (end < 0) {
    fail(`${file} has unterminated frontmatter`);
    return null;
  }
  const data = {};
  for (const line of text.slice(4, end).split("\n")) {
    if (line.trim().length === 0) {
      continue;
    }
    const split = line.indexOf(":");
    if (split < 0) {
      fail(`${file} has a frontmatter line without a colon`);
      continue;
    }
    const key = line.slice(0, split).trim();
    let value = line.slice(split + 1).trim();
    if (value.startsWith('"') && value.endsWith('"') && value.length >= 2) {
      value = value.slice(1, -1);
    }
    data[key] = value;
  }
  return data;
}

const ruleDir = path.join(root, ".cursor/rules");
const ruleFiles = readdirSync(ruleDir).filter((name) => name.endsWith(".mdc")).sort();
const expectedRuleFiles = rules.map(([name]) => name).sort();
if (ruleFiles.join("\n") !== expectedRuleFiles.join("\n")) {
  fail(`rule set mismatch: ${ruleFiles.join(", ")}`);
}

for (const [name, mode] of rules) {
  const relative = path.join(".cursor/rules", name);
  const text = read(relative);
  const lineCount = text.split("\n").length;
  if (lineCount > 200) {
    fail(`${relative} is ${String(lineCount)} lines`);
  }
  const data = frontmatter(text, relative);
  if (!data) {
    continue;
  }
  if (!data.description) {
    fail(`${relative} has no description`);
  }
  const always = data.alwaysApply;
  const globs = data.globs;
  if (mode === "always") {
    if (always !== "true") {
      fail(`${relative} must set alwaysApply: true`);
    }
    if (globs !== undefined) {
      fail(`${relative} must not set globs`);
    }
  }
  if (mode === "files") {
    if (always !== "false") {
      fail(`${relative} must set alwaysApply: false`);
    }
    if (!globs) {
      fail(`${relative} must set globs`);
    }
    const raw = text.split("\n").find((line) => line.startsWith("globs:")) ?? "";
    if (raw.slice("globs:".length).trim().startsWith("*")) {
      fail(`${relative} quotes globs that start with *`);
    }
  }
  if (mode === "intelligent") {
    if (always !== "false") {
      fail(`${relative} must set alwaysApply: false`);
    }
    if (globs !== undefined) {
      fail(`${relative} must omit globs so Cursor can apply it intelligently`);
    }
  }
  notes.push(`${relative}: ${mode}, ${String(lineCount)} lines`);
}

function walkSkills(relative, found) {
  for (const entry of readdirSync(path.join(root, relative), { withFileTypes: true })) {
    const next = path.join(relative, entry.name);
    if (entry.isDirectory()) {
      walkSkills(next, found);
      continue;
    }
    if (entry.name === "SKILL.md") {
      found.push(next);
    }
  }
}

const skillFiles = [];
walkSkills(".cursor/skills", skillFiles);
const seen = new Set();
for (const file of skillFiles) {
  const text = read(file);
  const lineCount = text.split("\n").length;
  if (lineCount > 500) {
    fail(`${file} is ${String(lineCount)} lines`);
  }
  const data = frontmatter(text, file);
  if (!data) {
    continue;
  }
  const folder = path.basename(path.dirname(file));
  if (data.name !== folder) {
    fail(`${file} name ${data.name ?? ""} does not match ${folder}`);
  }
  if (!data.description) {
    fail(`${file} has no description`);
  } else if (data.description.length > 1024) {
    fail(`${file} description is longer than 1024 characters`);
  } else if (!data.description.includes("Use when")) {
    fail(`${file} description has no trigger`);
  }
  if (data["disable-model-invocation"] === "true") {
    fail(`${file} disables automatic invocation`);
  }
  if (data.name) {
    if (seen.has(data.name)) {
      fail(`duplicate skill name ${data.name}`);
    }
    seen.add(data.name);
  }
  const skillDir = path.dirname(file);
  for (const match of text.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
    const href = match[1] ?? "";
    if (href.startsWith("references/") || href.startsWith("scripts/") || href.startsWith("assets/")) {
      const target = path.join(skillDir, href);
      if (!exists(target)) {
        fail(`${file} links missing ${href}`);
      }
    }
  }
  notes.push(`${file}: ${String(lineCount)} lines`);
}

for (const name of skills) {
  if (!seen.has(name)) {
    fail(`missing skill ${name}`);
  }
}
for (const name of seen) {
  if (!skills.includes(name)) {
    fail(`unexpected skill ${name}`);
  }
}

if (exists(".agents/skills")) {
  fail(".agents/skills duplicates the canonical .cursor/skills root");
}

const corpus = [];
function collect(relative) {
  const absolute = path.join(root, relative);
  let info;
  try {
    info = statSync(absolute);
  } catch {
    return;
  }
  if (info.isFile()) {
    if (relative.endsWith(".md") || relative.endsWith(".mdc")) {
      corpus.push(read(relative));
    }
    return;
  }
  for (const entry of readdirSync(absolute, { withFileTypes: true })) {
    if (entry.name === "node_modules") {
      continue;
    }
    collect(path.join(relative, entry.name));
  }
}
collect(".cursor");
collect("docs");
const mentioned = new Set();
for (const text of corpus) {
  for (const match of text.matchAll(/docs\/[a-z0-9./-]+\.(?:md|css)/g)) {
    mentioned.add(match[0]);
  }
  for (const match of text.matchAll(/\.cursor\/[a-z0-9./_-]+\.mjs/g)) {
    mentioned.add(match[0]);
  }
}
for (const relative of mentioned) {
  if (!exists(relative)) {
    fail(`missing referenced file ${relative}`);
  }
}

const tokens = read("docs/design/tokens.css");
for (const anchor of anchors) {
  if (!tokens.includes(anchor)) {
    fail(`tokens.css is missing ${anchor}`);
  }
}

const requiredDocs = [
  "docs/engineering/instruction-system.md",
  "docs/engineering/architecture.md",
  "docs/engineering/coding-standards.md",
  "docs/engineering/testing-standards.md",
  "docs/engineering/performance.md",
  "docs/design/design-system.md",
  "docs/design/color-system.md",
  "docs/design/typography.md",
  "docs/design/ux-guidelines.md",
  "docs/design/motion-guidelines.md",
  "docs/design/tokens.css",
  "docs/security/security-standards.md",
  "docs/security/authentication-authorization.md",
  "docs/security/tenant-isolation.md",
  "docs/security/api-security.md",
  "docs/security/privacy.md",
  "docs/product/observability-domain.md",
  "docs/product/monitoring-integrity.md",
  "docs/quality/accessibility.md",
  "docs/quality/responsive-design.md",
  "docs/quality/seo.md",
  "docs/quality/website-quality.md",
  "docs/quality/prelaunch-checklist.md",
];
for (const relative of requiredDocs) {
  if (!exists(relative)) {
    fail(`missing ${relative}`);
  }
}

if (errors.length > 0) {
  process.stderr.write(errors.join("\n") + "\n");
  process.exit(1);
}

process.stdout.write(`rules: ${String(rules.length)}\nskills: ${String(skills.length)}\n`);
process.stdout.write(`referenced paths checked: ${String(mentioned.size)}\n`);
for (const note of notes) {
  process.stdout.write(`${note}\n`);
}
