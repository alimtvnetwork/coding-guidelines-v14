/**
 * Syntax highlighting utilities for code blocks.
 */
import hljs from "highlight.js/lib/core";
import "highlight.js/styles/github-dark.css";
import typescript from "highlight.js/lib/languages/typescript";
import go from "highlight.js/lib/languages/go";
import php from "highlight.js/lib/languages/php";
import css from "highlight.js/lib/languages/css";
import json from "highlight.js/lib/languages/json";
import bash from "highlight.js/lib/languages/bash";
import sql from "highlight.js/lib/languages/sql";
import rust from "highlight.js/lib/languages/rust";
import xml from "highlight.js/lib/languages/xml";
import yaml from "highlight.js/lib/languages/yaml";
import markdown from "highlight.js/lib/languages/markdown";
import {
  TYPESCRIPT_LANGS, JAVASCRIPT_LANGS, GO_LANGS,
  PLAINTEXT_LANGS, ALL_SUPPORTED_LANGS,
} from "./constants";

hljs.registerLanguage("typescript", typescript);
hljs.registerLanguage("ts", typescript);
hljs.registerLanguage("tsx", typescript);
hljs.registerLanguage("javascript", typescript);
hljs.registerLanguage("js", typescript);
hljs.registerLanguage("go", go);
hljs.registerLanguage("golang", go);
hljs.registerLanguage("php", php);
hljs.registerLanguage("css", css);
hljs.registerLanguage("json", json);
hljs.registerLanguage("bash", bash);
hljs.registerLanguage("sh", bash);
hljs.registerLanguage("shell", bash);
hljs.registerLanguage("sql", sql);
hljs.registerLanguage("rust", rust);
hljs.registerLanguage("html", xml);
hljs.registerLanguage("xml", xml);
hljs.registerLanguage("yaml", yaml);
hljs.registerLanguage("yml", yaml);
hljs.registerLanguage("markdown", markdown);
hljs.registerLanguage("md", markdown);

const TREE_CHARS_PATTERN = /[├└│─]/;
const TREE_DIR_PATTERN = /^\s*[A-Za-z0-9{}._-]+\/$/m;
const TREE_FILE_PATTERN = /^\s*[A-Za-z0-9{}._-]+\.[A-Za-z0-9_-]+\s*$/m;
const PLAINTEXT_LANG = "plaintext";

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function normalizeLang(lang: string): string {
  const normalized = lang.trim().toLowerCase();

  if (TYPESCRIPT_LANGS.includes(normalized)) return normalized;

  if (JAVASCRIPT_LANGS.includes(normalized)) return normalized;

  if (GO_LANGS.includes(normalized)) return normalized;

  if (ALL_SUPPORTED_LANGS.includes(normalized)) return normalized;

  if (PLAINTEXT_LANGS.includes(normalized)) return "";

  return normalized;
}

export function looksLikeTree(code: string): boolean {
  return (
    TREE_CHARS_PATTERN.test(code) ||
    TREE_DIR_PATTERN.test(code) ||
    TREE_FILE_PATTERN.test(code)
  );
}

export function highlightTreeLine(line: string): string {
  const commentIndex = line.indexOf("#");
  const hasComment = commentIndex >= 0;
  const content = hasComment ? line.slice(0, commentIndex).replace(/\s+$/, "") : line;
  const comment = hasComment ? line.slice(commentIndex) : "";

  const highlighted = escapeHtml(content)
    .replace(/([├└│─┌┐┘┬┴┤┼]+)/g, '<span class="tree-guide">$1</span>')
    .replace(/(\.\.\.)/g, '<span class="tree-ellipsis">$1</span>')
    .replace(/([A-Za-z0-9{}._-]+\/)/g, '<span class="tree-dir">📁 $1</span>')
    .replace(/([A-Za-z0-9{}._-]+\.[A-Za-z0-9._-]+)/g, '<span class="tree-file">📄 $1</span>');

  if (!hasComment) return highlighted;

  return `${highlighted} <span class="tree-comment">${escapeHtml(comment)}</span>`;
}

function highlightAsTree(code: string): string {
  return code.split("\n").map(highlightTreeLine).join("\n");
}

function tryHighlightWithLang(code: string, lang: string): string {
  try {
    return hljs.highlight(code, { language: lang }).value;
  } catch {
    return escapeHtml(code);
  }
}

function tryAutoHighlight(code: string): string {
  try {
    const auto = hljs.highlightAuto(code);

    if (auto.language === PLAINTEXT_LANG && looksLikeTree(code)) {
      return highlightAsTree(code);
    }

    return auto.value;
  } catch {
    return escapeHtml(code);
  }
}

export function highlightCode(code: string, lang: string): string {
  const normalizedLang = normalizeLang(lang);

  if (!normalizedLang && looksLikeTree(code)) {
    return highlightAsTree(code);
  }

  if (normalizedLang && hljs.getLanguage(normalizedLang)) {
    return tryHighlightWithLang(code, normalizedLang);
  }

  return tryAutoHighlight(code);
}

export function resolveDisplayLang(code: string, lang: string): string {
  const normalizedLang = normalizeLang(lang);

  if (!normalizedLang && looksLikeTree(code)) return "tree";

  return normalizedLang;
}
