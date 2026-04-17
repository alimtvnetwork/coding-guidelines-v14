#!/usr/bin/env node
// Regenerate src/data/specTree.json from spec/**/*.md.
// Run: node scripts/sync-spec-tree.mjs
// Wired into npm scripts: `sync` and `prebuild`.
//
// Schema (matches existing consumer in src/):
//   { specTree: Node[] }
// where Node = {
//   name: string,                         // title-cased, no leading "NN-"
//   type: "file" | "folder",
//   path: string,                         // relative to spec/
//   content?: string,                     // for files only — full markdown
//   children?: Node[],                    // for folders only
// }

import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { resolve, join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const SPEC_ROOT = resolve(ROOT, "spec");
const OUT_PATH = resolve(ROOT, "src/data/specTree.json");

const IGNORED = new Set([".DS_Store", "Thumbs.db", ".git"]);

function isVisibleEntry(name) {
  if (IGNORED.has(name)) return false;
  if (name.startsWith(".")) return false;
  return true;
}

function isMarkdown(name) {
  return name.endsWith(".md");
}

function stripLeadingNumber(slug) {
  // "14-update" -> "update", "09-code-block-system" -> "code-block-system"
  return slug.replace(/^\d+[-_]/, "");
}

function titleCase(slug) {
  // "code-block-system" -> "Code Block System"
  // "wp-plugin-how-to" -> "Wp Plugin How To" — caller can post-process special tokens.
  return slug
    .split(/[-_]/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function specialCaseAcronyms(name) {
  // Match historical specTree casing for known tokens.
  return name
    .replace(/\bCicd\b/g, "CICD")
    .replace(/\bWp\b/g, "WP")
    .replace(/\bUi\b/g, "UI")
    .replace(/\bDb\b/g, "DB")
    .replace(/\bApi\b/g, "API")
    .replace(/\bCli\b/g, "CLI");
}

function deriveName(slug) {
  return specialCaseAcronyms(titleCase(stripLeadingNumber(slug)));
}

function deriveFileName(filename) {
  // "00-overview.md" -> "Overview"
  return deriveName(filename.replace(/\.md$/, ""));
}

function naturalSort(a, b) {
  // Sort entries so "01-x" < "02-x" < "10-x".
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
}

function readMarkdown(absPath) {
  return readFileSync(absPath, "utf8");
}

function buildNode(absPath, relPath, name) {
  const stats = statSync(absPath);
  if (stats.isDirectory()) {
    const children = listChildren(absPath, relPath);
    return { name, type: "folder", path: relPath, children };
  }
  return {
    name,
    type: "file",
    path: relPath,
    content: readMarkdown(absPath),
  };
}

function listChildren(absDir, relDir) {
  const entries = readdirSync(absDir).filter(isVisibleEntry).sort(naturalSort);

  const nodes = [];
  for (const entry of entries) {
    const absChild = join(absDir, entry);
    const relChild = relDir ? `${relDir}/${entry}` : entry;
    const stats = statSync(absChild);

    if (stats.isDirectory()) {
      nodes.push(buildNode(absChild, relChild, deriveName(entry)));
      continue;
    }
    if (!isMarkdown(entry)) continue;
    nodes.push(buildNode(absChild, relChild, deriveFileName(entry)));
  }
  return nodes;
}

function buildSpecTree() {
  return listChildren(SPEC_ROOT, "");
}

function countNodes(nodes) {
  let files = 0;
  let folders = 0;
  for (const n of nodes) {
    if (n.type === "folder") {
      folders += 1;
      const sub = countNodes(n.children || []);
      files += sub.files;
      folders += sub.folders;
      continue;
    }
    files += 1;
  }
  return { files, folders };
}

function writeOutput(tree) {
  const json = JSON.stringify({ specTree: tree }, null, 2) + "\n";
  writeFileSync(OUT_PATH, json);
}

function main() {
  const tree = buildSpecTree();
  writeOutput(tree);
  const counts = countNodes(tree);
  const rel = relative(ROOT, OUT_PATH);
  console.log(
    `  OK ${rel} regenerated -> ${counts.files} files, ${counts.folders} folders, ${tree.length} top-level entries`,
  );
}

main();
