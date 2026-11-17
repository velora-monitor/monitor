import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const findings = [];

const patterns = [
  { name: "private-key", re: /-----BEGIN (?:RSA |OPENSSH |EC |DSA )?PRIVATE KEY-----/ },
  { name: "aws-access-key", re: /AKIA[0-9A-Z]{16}/ },
  { name: "stripe-live-secret", re: /sk_live_[0-9a-zA-Z]{10,}/ },
  { name: "github-token", re: /ghp_[0-9A-Za-z]{20,}/ },
  { name: "slack-token", re: /xox[baprs]-[0-9A-Za-z-]{10,}/ },
  { name: "service-role-assignment", re: /SUPABASE_SERVICE_ROLE_KEY\s*=\s*\S+/ },
  { name: "database-url-assignment", re: /DATABASE_URL\s*=\s*\S+/ },
  { name: "resend-assignment", re: /RESEND_API_KEY\s*=\s*\S+/ },
];

function trackedFiles() {
  try {
    const output = execFileSync("git", ["ls-files", "-z"], {
      cwd: root,
      encoding: "buffer",
      stdio: ["ignore", "pipe", "ignore"],
    });
    return output.toString("utf8").split("\0").filter((file) => file.length > 0);
  } catch {
    return walk(".");
  }
}

function walk(relative) {
  const absolute = path.join(root, relative);
  const entries = readdirSync(absolute, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.name === "node_modules" || entry.name === "dist" || entry.name === ".git") {
      continue;
    }
    const next = path.join(relative, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(next));
      continue;
    }
    files.push(next);
  }
  return files;
}

function ignored(file) {
  return (
    file === "pnpm-lock.yaml" ||
    file.endsWith("/go.sum") ||
    file.endsWith("scan-secrets.mjs") ||
    file.endsWith("verify-instruction-system.mjs")
  );
}

for (const file of trackedFiles()) {
  if (ignored(file)) {
    continue;
  }
  const absolute = path.join(root, file);
  const info = statSync(absolute);
  if (!info.isFile() || info.size > 1_000_000) {
    continue;
  }
  const text = readFileSync(absolute);
  if (text.includes(0)) {
    continue;
  }
  const lines = text.toString("utf8").split("\n");
  for (let index = 0; index < lines.length; index += 1) {
    for (const pattern of patterns) {
      if (pattern.re.test(lines[index] ?? "")) {
        findings.push(`${file}:${String(index + 1)}:${pattern.name}`);
      }
    }
  }
}

if (findings.length === 0) {
  process.stdout.write("secret scan: no findings\n");
  process.exit(0);
}

process.stdout.write(`secret scan: ${String(findings.length)} finding(s)\n`);
for (const finding of findings) {
  process.stdout.write(`${finding}\n`);
}
process.exit(1);
