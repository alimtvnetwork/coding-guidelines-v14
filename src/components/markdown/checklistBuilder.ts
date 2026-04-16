/**
 * Checklist extraction and rendering for markdown.
 */
import { escapeHtml } from "./highlighter";
import type { ExtractionResult } from "./types";

const CHECKLIST_PATTERN = /^(\s*)([-*+]|\d+\.)\s+\[([ xX])\]\s+(.+)$/;

function applyInlineMarkdown(text: string): string {
  return text
    .replace(/`([^`]+)`/g, (_m, code: string) => `<code class="inline-code">${escapeHtml(code)}</code>`)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a class="spec-link" href="$2">$1</a>');
}

function buildChecklistItemHtml(line: string): string {
  const match = line.match(CHECKLIST_PATTERN);

  if (!match) return "";

  const indent = match[1].replace(/\t/g, "  ").length;
  const isChecked = /x/i.test(match[3]);
  const content = applyInlineMarkdown(match[4]);
  const level = Math.floor(indent / 2);
  const checkedClass = isChecked ? " checked" : "";
  const boxClass = isChecked ? "checked-box" : "empty-box";
  const boxContent = isChecked ? "✓" : "";

  return `<li class="spec-checkbox${checkedClass}" style="margin-left: ${level * 1}rem"><span class="checkbox-box ${boxClass}">${boxContent}</span><span class="checklist-item-content">${content}</span></li>`;
}

function encodeChecklistMarkdown(lines: string[]): string {
  return escapeHtml(lines.join("\n"))
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/\n/g, "&#10;");
}

function buildShareButton(encodedMarkdown: string): string {
  return `<button class="checklist-export-btn" data-checklist="${encodedMarkdown}" title="Export checklist"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg><span>Export</span></button>`;
}

function buildCopyButton(encodedMarkdown: string): string {
  return `<button class="checklist-copy-btn" data-checklist="${encodedMarkdown}" title="Copy checklist as Markdown"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg><span>Copy</span></button>`;
}

export function buildChecklistBlockHtml(lines: string[], id: number): string {
  const encodedMarkdown = encodeChecklistMarkdown(lines);
  const items = lines.map(buildChecklistItemHtml).join("");

  return `<div class="checklist-block" data-checklist-id="${id}"><div class="checklist-header"><span class="checklist-title">Checklist</span><div class="checklist-actions">${buildCopyButton(encodedMarkdown)}${buildShareButton(encodedMarkdown)}</div></div><ul class="checklist-items">${items}</ul></div>`;
}

interface ChecklistContext {
  result: string[];
  store: Record<string, string>;
  blockId: number;
}

function flushBlock(block: string[], ctx: ChecklistContext): void {

  if (block.length === 0) return;

  const placeholder = `\x00CHECKLIST_${ctx.blockId}\x00`;
  ctx.store[placeholder] = buildChecklistBlockHtml(block, ctx.blockId);
  ctx.result.push(placeholder);
}

export function extractChecklistBlocks(md: string): ExtractionResult {
  const lines = md.split("\n");
  const ctx: ChecklistContext = { result: [], store: {}, blockId: 0 };
  let currentBlock: string[] = [];

  for (const line of lines) {

    if (CHECKLIST_PATTERN.test(line)) {
      currentBlock.push(line);
      continue;
    }

    flushBlock(currentBlock, ctx);

    if (currentBlock.length > 0) { ctx.blockId += 1; currentBlock = []; }
    ctx.result.push(line);
  }

  flushBlock(currentBlock, ctx);

  return { text: ctx.result.join("\n"), store: ctx.store };
}
