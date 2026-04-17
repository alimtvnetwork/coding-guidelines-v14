#!/usr/bin/env node
// Sync version.json from package.json — single source of truth.
// Run: node scripts/sync-version.mjs
// Wired into npm scripts: `sync` and `prebuild`.

import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function writeJson(path, data) {
  writeFileSync(path, JSON.stringify(data, null, 2) + "\n");
}

function todayUtc8() {
  // Malaysia (UTC+8) per user preferences.
  const now = new Date(Date.now() + 8 * 60 * 60 * 1000);
  return now.toISOString().slice(0, 10);
}

function syncVersion() {
  const pkgPath = resolve(ROOT, "package.json");
  const verPath = resolve(ROOT, "version.json");

  const pkg = readJson(pkgPath);
  const existing = (() => {
    try { return readJson(verPath); } catch { return {}; }
  })();

  const next = {
    version: pkg.version,
    updated: todayUtc8(),
    name: existing.name || "coding-guidelines",
    description:
      existing.description ||
      "Cross-language coding standards, error handling, CI/CD, and self-update specifications.",
  };

  writeJson(verPath, next);
  console.log(`  OK version.json synced -> v${next.version} (${next.updated})`);
}

syncVersion();
