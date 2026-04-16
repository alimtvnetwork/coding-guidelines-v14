/**
 * Converts markdown text to HTML, handling code blocks, checklists, tables, and inline formatting.
 */
import { escapeHtml } from "./highlighter";
import { extractCodeBlocks } from "./codeBlockExtractor";
import { extractChecklistBlocks } from "./checklistBuilder";
import type { ExtractionResult } from "./types";

function extractInlineCodes(html: string): ExtractionResult {
  const store: Record<string, string> = {};
  const counter = { value: 0 };

  const text = html.replace(/`([^`]+)`/g, (_m, code: string) => {
    const placeholder = `\x00INLINECODE_${counter.value++}\x00`;
    store[placeholder] = `<code class="inline-code">${escapeHtml(code)}</code>`;

    return placeholder;
  });

  return { text, store };
}

function convertTableHeader(header: string): string {
  return header
    .split("|")
    .filter((c: string) => c.trim())
    .map((c: string) => `<th>${c.trim()}</th>`)
    .join("");
}

function convertTableRow(row: string, idx: number): string {
  const tds = row
    .split("|")
    .filter((c: string) => c.trim())
    .map((c: string) => `<td>${c.trim()}</td>`)
    .join("");
  const rowClass = idx % 2 === 0 ? "even-row" : "odd-row";

  return `<tr class="${rowClass}">${tds}</tr>`;
}

function convertTables(html: string): string {
  return html.replace(
    /^(\|.+\|)\n(\|[-| :]+\|)\n((?:\|.+\|\n?)*)/gm,
    (_m, header: string, _sep: string, body: string) => {
      const ths = convertTableHeader(header);
      const rows = body.trim().split("\n").map(convertTableRow).join("");

      return `<div class="table-wrapper my-5"><table><thead><tr>${ths}</tr></thead><tbody>${rows}</tbody></table></div>`;
    }

  );
}

function convertInlineFormatting(html: string): string {
  const result = html
    .replace(/^#### (.+)$/gm, '<h4 class="spec-h4">$1</h4>')
    .replace(/^### (.+)$/gm, '<h3 class="spec-h3">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="spec-h2">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="spec-h1">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="spec-link">$1</a>')
    .replace(/^> (.+)$/gm, '<blockquote class="spec-blockquote">$1</blockquote>')
    .replace(/^---$/gm, '<hr class="spec-hr" />');

  return result;
}

function convertLists(html: string): string {
  const result = html
    .replace(/^\d+\. (.+)$/gm, '<li class="spec-oli">$1</li>')
    .replace(/^[-*+] (.+)$/gm, '<li class="spec-li">$1</li>')
    .replace(/(<li class="spec-(?:li|oli)">.*<\/li>\n?)+/g, (match) => {

      if (match.includes("spec-oli")) return `<ol class="spec-ol">${match}</ol>`;

      return `<ul class="spec-ul">${match}</ul>`;
    });

  return result;
}

function wrapParagraphs(html: string): string {
  return html
    .replace(/^(?!<[a-z]|\x00|$)(.+)$/gm, "<p class='spec-p'>$1</p>")
    .replace(/^(<strong>.+)$/gm, "<p class='spec-p'>$1</p>");
}

function restorePlaceholders(html: string, stores: Record<string, string>[]): string {
  const result = stores.reduce(
    (acc, store) => Object.entries(store).reduce(
      (inner, [placeholder, block]) => inner.replace(placeholder, block),
      acc
    ),
    html
  );

  return result;
}

export function renderMarkdown(md: string): string {
  const { text: codeFreeText, store: codeBlockStore } = extractCodeBlocks(md);
  const { text: checklistFreeText, store: checklistStore } = extractChecklistBlocks(codeFreeText);
  const { text: inlineCodeFree, store: inlineCodeStore } = extractInlineCodes(checklistFreeText);

  const html = restorePlaceholders(
    wrapParagraphs(convertLists(convertInlineFormatting(convertTables(inlineCodeFree)))),
    [codeBlockStore, inlineCodeStore, checklistStore]
  );

  return html;
}
