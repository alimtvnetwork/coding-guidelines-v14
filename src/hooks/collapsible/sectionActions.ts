import { copyTextToClipboard } from "@/lib/clipboard";
import { extractFormattedText } from "./extractFormattedText";

const COPY_RESET_DELAY = 2000;
const SLUG_PATTERN = /[^a-z0-9]+/gi;

const COPY_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`;
const CHECK_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
const DOWNLOAD_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>`;
const TOOLTIP_HTML = `<span class="section-tooltip">Copied!</span>`;

interface CopyButtonState {
  title: string;
  innerHTML: string;
  isCopied: boolean;
}

function buildSectionMarkdown(section: HTMLElement, headingText: string): string {
  const body = section.querySelector(".collapsible-body-inner");
  const bodyContent = body ? extractFormattedText(body) : "";

  return [`## ${headingText.trim() || "section"}`, bodyContent].filter(Boolean).join("\n\n").trim();
}

function slugifyHeading(text: string): string {
  return text.replace(SLUG_PATTERN, "-").toLowerCase();
}

function applyCopyState(btn: HTMLButtonElement, state: CopyButtonState): void {
  btn.classList.toggle("copied", state.isCopied);
  btn.title = state.title;
  btn.innerHTML = state.innerHTML;
}

function handleCopyResult(copyBtn: HTMLButtonElement, queueReset: () => void, error?: unknown): void {
  if (error) {
    console.error("Failed to copy section content.", error);
    applyCopyState(copyBtn, { title: "Copy failed — try again", innerHTML: `${COPY_ICON}<span>Retry</span>`, isCopied: false });
  } else {
    applyCopyState(copyBtn, { title: "Copied", innerHTML: `${CHECK_ICON}<span>Copied</span>${TOOLTIP_HTML}`, isCopied: true });
  }

  queueReset();
}

function setupCopyReset(copyBtn: HTMLButtonElement): () => void {
  let copyResetTimer: number | undefined;

  const resetCopyButton = () => applyCopyState(copyBtn, { title: "Copy section", innerHTML: `${COPY_ICON}<span>Copy</span>`, isCopied: false });

  return () => {
    if (copyResetTimer) {
      window.clearTimeout(copyResetTimer);
    }

    copyResetTimer = window.setTimeout(resetCopyButton, COPY_RESET_DELAY);
  };
}

export function createCopyButton(section: HTMLElement, headingText: string): HTMLButtonElement {
  const copyBtn = document.createElement("button");
  copyBtn.className = "section-action-btn section-copy-btn";
  copyBtn.title = "Copy section";
  copyBtn.innerHTML = `${COPY_ICON}<span>Copy</span>`;
  const queueReset = setupCopyReset(copyBtn);

  copyBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    const content = buildSectionMarkdown(section, headingText);
    copyTextToClipboard(content)
      .then(() => handleCopyResult(copyBtn, queueReset))
      .catch((err) => handleCopyResult(copyBtn, queueReset, err));
  });

  return copyBtn;
}

function triggerDownload(content: string, filename: string): void {
  const blob = new Blob([content.trim()], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function createDownloadButton(section: HTMLElement, headingText: string): HTMLButtonElement {
  const downloadBtn = document.createElement("button");
  downloadBtn.className = "section-action-btn section-download-btn";
  downloadBtn.title = "Download section";
  downloadBtn.innerHTML = `${DOWNLOAD_ICON}<span>Download</span>`;

  downloadBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const content = buildSectionMarkdown(section, headingText);
    triggerDownload(content, `${slugifyHeading(headingText)}.md`);
  });

  return downloadBtn;
}
