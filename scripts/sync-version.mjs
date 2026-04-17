#!/usr/bin/env node
// Sync version.json from package.json + spec/ frontmatter.
//
// Output schema (extended manifest, backwards-compatible — `version`,
// `updated`, `name`, `description` remain at the root for the installer
// script that reads them with `cat version.json | python3 -c ...`):
//
//   {
//     version, updated, name, description,        // root summary
//     git: { sha, shortSha, branch },             // build provenance
//     stats: { totalFiles, totalLines, totalFolders, totalBytes },
//     folders: [
//       {
//         path: "01-spec-authoring-guide",
//         name: "Spec Authoring Guide",
//         title: "Spec Authoring Guide",          // from H1 in 00-overview
//         version: "3.1.0" | null,                // from frontmatter
//         updated: "2026-04-16" | null,
//         status: "Active" | null,
//         aiConfidence: "Production-Ready" | null,
//         ambiguity: "None" | null,
//         fileCount, lineCount, byteCount         // recursive
//       }
//     ]
//   }
//
// Run: node scripts/sync-version.mjs
// Wired into: `sync`, `prebuild`, husky pre-commit.

import { execSync } from "node:child_process";
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { resolve, join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const SPEC_ROOT = resolve(ROOT, "spec");
const VERSION_PATH = resolve(ROOT, "version.json");
const PKG_PATH = resolve(ROOT, "package.json");

// ---------- file IO ----------

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function writeJson(path, data) {
  writeFileSync(path, JSON.stringify(data, null, 2) + "\n");
}

function readText(path) {
  return readFileSync(path, "utf8");
}

// ---------- date (UTC+8 per user prefs) ----------

function todayUtc8() {
  const now = new Date(Date.now() + 8 * 60 * 60 * 1000);
  return now.toISOString().slice(0, 10);
}

// ---------- git provenance ----------

function tryGit(args) {
  try {
    return execSync(`git ${args}`, { cwd: ROOT, stdio: ["ignore", "pipe", "ignore"] })
      .toString()
      .trim();
  } catch {
    return null;
  }
}

function readGitInfo() {
  const sha = tryGit("rev-parse HEAD");
  return {
    sha: sha,
    shortSha: sha ? sha.slice(0, 7) : null,
    branch: tryGit("rev-parse --abbrev-ref HEAD"),
  };
}

// ---------- frontmatter parsing ----------

// Match `**Key:** Value` or `> **Key:** Value` (blockquote variant).
// Trailing two-space line break is tolerated.
function buildKeyMatcher(key) {
  return new RegExp(
    `^\\s*>?\\s*\\*\\*${key}:\\*\\*\\s*(.+?)\\s*$`,
    "im",
  );
}

function extractField(text, ...keyAliases) {
  for (const key of keyAliases) {
    const m = text.match(buildKeyMatcher(key));
    if (m) return m[1].replace(/\s+$/, "").trim();
  }
  return null;
}

function extractTitle(text) {
  // First H1 — strip "# 08 — " style numeric prefix.
  const h1 = text.match(/^#\s+(.+?)\s*$/m);
  if (!h1) return null;
  return h1[1]
    .replace(/^\d+\s*[-—–]\s*/, "")
    .replace(/\s+—\s+Overview\s*$/i, "")
    .trim();
}

function parseOverview(absPath) {
  let text;
  try { text = readText(absPath); } catch { return {}; }

  return {
    title:        extractTitle(text),
    version:      extractField(text, "Version", "Spec Version"),
    updated:      extractField(text, "Updated"),
    status:       extractField(text, "Status"),
    aiConfidence: extractField(text, "AI Confidence"),
    ambiguity:    extractField(text, "Ambiguity"),
  };
}

// ---------- folder stats ----------

function isVisible(name) {
  if (name.startsWith(".")) return false;
  if (name === "node_modules") return false;
  return true;
}

function walkStats(absPath) {
  let files = 0;
  let lines = 0;
  let bytes = 0;

  const stack = [absPath];
  while (stack.length > 0) {
    const cur = stack.pop();
    let entries;
    try { entries = readdirSync(cur); } catch { continue; }

    for (const entry of entries) {
      if (!isVisible(entry)) continue;
      const child = join(cur, entry);
      let st;
      try { st = statSync(child); } catch { continue; }

      if (st.isDirectory()) { stack.push(child); continue; }
      if (!entry.endsWith(".md")) continue;

      files += 1;
      bytes += st.size;
      try {
        const content = readText(child);
        lines += content.split("\n").length;
      } catch { /* skip unreadable */ }
    }
  }
  return { fileCount: files, lineCount: lines, byteCount: bytes };
}

// ---------- folder name derivation ----------

function specialAcronyms(s) {
  return s
    .replace(/\bCicd\b/g, "CICD")
    .replace(/\bWp\b/g,   "WP")
    .replace(/\bUi\b/g,   "UI")
    .replace(/\bDb\b/g,   "DB")
    .replace(/\bApi\b/g,  "API")
    .replace(/\bCli\b/g,  "CLI");
}

function deriveDisplayName(slug) {
  const stripped = slug.replace(/^\d+[-_]/, "");
  const titled = stripped
    .split(/[-_]/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  return specialAcronyms(titled);
}

// ---------- folder discovery ----------

function listSpecFolders() {
  let entries;
  try { entries = readdirSync(SPEC_ROOT); } catch { return []; }

  const folders = [];
  for (const name of entries) {
    if (!isVisible(name)) continue;
    if (!/^\d+[-_]/.test(name)) continue;        // only NN-* folders
    const abs = join(SPEC_ROOT, name);
    let st;
    try { st = statSync(abs); } catch { continue; }
    if (!st.isDirectory()) continue;
    folders.push({ slug: name, abs });
  }

  // Numeric sort: 02 < 09 < 10.
  folders.sort((a, b) =>
    a.slug.localeCompare(b.slug, undefined, { numeric: true }),
  );
  return folders;
}

function buildFolderEntry({ slug, abs }) {
  const overview = parseOverview(join(abs, "00-overview.md"));
  const stats = walkStats(abs);
  return {
    path:         slug,
    name:         deriveDisplayName(slug),
    title:        overview.title || null,
    version:      overview.version || null,
    updated:      overview.updated || null,
    status:       overview.status || null,
    aiConfidence: overview.aiConfidence || null,
    ambiguity:    overview.ambiguity || null,
    fileCount:    stats.fileCount,
    lineCount:    stats.lineCount,
    byteCount:    stats.byteCount,
  };
}

function buildFolderEntries() {
  return listSpecFolders().map(buildFolderEntry);
}

// ---------- aggregate stats ----------

function sumStats(folders) {
  const totalFiles = folders.reduce((a, f) => a + f.fileCount, 0);
  const totalLines = folders.reduce((a, f) => a + f.lineCount, 0);
  const totalBytes = folders.reduce((a, f) => a + f.byteCount, 0);
  return {
    totalFiles,
    totalLines,
    totalFolders: folders.length,
    totalBytes,
  };
}

// ---------- build & write manifest ----------

function loadExistingMeta() {
  try {
    const v = readJson(VERSION_PATH);
    return { name: v.name, description: v.description };
  } catch {
    return {};
  }
}

function buildManifest() {
  const pkg = readJson(PKG_PATH);
  const existing = loadExistingMeta();
  const folders = buildFolderEntries();

  return {
    version:     pkg.version,
    updated:     todayUtc8(),
    name:        existing.name || "coding-guidelines",
    description:
      existing.description ||
      "Cross-language coding standards, error handling, CI/CD, and self-update specifications.",
    git:         readGitInfo(),
    stats:       sumStats(folders),
    folders:     folders,
  };
}

function logSummary(manifest) {
  const v = manifest.version;
  const u = manifest.updated;
  const sha = manifest.git.shortSha || "no-git";
  const s = manifest.stats;
  console.log(
    `  OK version.json synced -> v${v} (${u}, git ${sha})`,
  );
  console.log(
    `     ${s.totalFolders} folders, ${s.totalFiles} files, ${s.totalLines.toLocaleString()} lines, ${(s.totalBytes / 1024).toFixed(1)} KB`,
  );
  const versioned = manifest.folders.filter((f) => f.version).length;
  const missing = manifest.folders.length - versioned;
  if (missing > 0) {
    console.log(
      `     !! ${missing} folder(s) missing **Version:** in 00-overview.md`,
    );
  }
}

function main() {
  const manifest = buildManifest();
  writeJson(VERSION_PATH, manifest);
  logSummary(manifest);
}

main();
