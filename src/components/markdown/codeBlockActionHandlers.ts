/**
 * Copy feedback, download, and fullscreen handlers for code blocks.
 */
import { copyTextToClipboard } from "@/lib/clipboard";
import { COPY_FEEDBACK_DELAY } from "./constants";
import {
  COPIED_FEEDBACK_COLOR, SELECTOR_COPY_BTN, SELECTOR_DOWNLOAD_BTN,
  SELECTOR_FULLSCREEN_BTN, SELECTOR_CHECKLIST_COPY_BTN, SELECTOR_CHECKLIST_EXPORT_BTN,
  SELECTOR_COPY_SELECTED_BTN, SELECTOR_CLEAR_SELECTED_BTN,
  SELECTOR_CODE_LINE, SELECTOR_CODE_WRAPPER,
  LINE_PINNED_CLASS,
  decodeEscaped, findClosestBtn,
} from "./codeBlockDomHelpers";

function setCopyIconVisible(btn: HTMLButtonElement, isVisible: boolean): void {
  const copyIcon = btn.querySelector(".copy-icon") as SVGElement;

  if (!copyIcon) return;

  copyIcon.style.display = isVisible ? "block" : "none";
}

function setCheckIconVisible(btn: HTMLButtonElement, isVisible: boolean): void {
  const checkIcon = btn.querySelector(".check-icon") as SVGElement;

  if (!checkIcon) return;

  checkIcon.style.display = isVisible ? "block" : "none";

  if (isVisible) checkIcon.style.color = COPIED_FEEDBACK_COLOR;
}

function setCopyLabel(btn: HTMLButtonElement, text: string): void {
  const label = btn.querySelector(".copy-label") as HTMLElement;

  if (!label) return;

  label.textContent = text;
}

function showCopyFeedback(btn: HTMLButtonElement, labelText: string): void {
  setCopyIconVisible(btn, false);
  setCheckIconVisible(btn, true);
  setCopyLabel(btn, "Copied!");
  btn.classList.add("copied");

  setTimeout(() => {
    setCopyIconVisible(btn, true);
    setCheckIconVisible(btn, false);
    setCopyLabel(btn, labelText);
    btn.classList.remove("copied");
  }, COPY_FEEDBACK_DELAY);
}

function runCopyAction(text: string, onSuccess: () => void, errorMessage: string): void {
  void copyTextToClipboard(text)
    .then(onSuccess)
    .catch((error) => {
      console.error(errorMessage, error);
    });
}

export function createCopyHandler() {
  return (e: Event) => {
    const btn = findClosestBtn(e, SELECTOR_COPY_BTN);

    if (!btn) return;

    const code = decodeEscaped(btn.dataset.code || "");
    runCopyAction(code, () => showCopyFeedback(btn, "Copy"), "Failed to copy code block.");
  };
}

export function createDownloadHandler() {
  return (e: Event) => {
    const btn = findClosestBtn(e, SELECTOR_DOWNLOAD_BTN);

    if (!btn) return;

    const code = decodeEscaped(btn.dataset.code || "");
    const ext = btn.dataset.ext || "txt";
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `code.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };
}

export function createFullscreenHandler(
  setFullscreenBlock: (updater: (prev: string | null) => string | null) => void
) {
  return (e: Event) => {
    const btn = findClosestBtn(e, SELECTOR_FULLSCREEN_BTN);

    if (!btn) return;

    const blockId = btn.dataset.blockId || "";
    setFullscreenBlock((prev) => (prev === blockId ? null : blockId));
  };
}

function setChecklistLabel(btn: HTMLButtonElement, text: string): void {
  const label = btn.querySelector("span");

  if (!label) return;

  label.textContent = text;
}

export function createChecklistCopyHandler() {
  return (e: Event) => {
    const btn = findClosestBtn(e, SELECTOR_CHECKLIST_COPY_BTN);

    if (!btn) return;

    const text = decodeEscaped(btn.dataset.checklist || "");
    runCopyAction(text, () => {
      setChecklistLabel(btn, "Copied!");

      setTimeout(() => {
        setChecklistLabel(btn, "Copy");
      }, COPY_FEEDBACK_DELAY);
    }, "Failed to copy checklist.");
  };
}

function triggerDownload(text: string) {
  const blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "checklist.md";
  link.click();
  URL.revokeObjectURL(url);
}

export function createChecklistExportHandler() {
  return (e: Event) => {
    const btn = findClosestBtn(e, SELECTOR_CHECKLIST_EXPORT_BTN);

    if (!btn) return;

    const text = decodeEscaped(btn.dataset.checklist || "");
    triggerDownload(text);
    setChecklistLabel(btn, "Exported!");

    setTimeout(() => {
      setChecklistLabel(btn, "Export");
    }, COPY_FEEDBACK_DELAY);
  };
}

export function createCopySelectedHandler() {
  return (e: Event) => {
    const btn = findClosestBtn(e, SELECTOR_COPY_SELECTED_BTN);

    if (!btn) return;

    const wrapper = btn.closest(SELECTOR_CODE_WRAPPER);

    if (!wrapper) return;

    const pinned = wrapper.querySelectorAll(`${SELECTOR_CODE_LINE}.${LINE_PINNED_CLASS}`);
    const text = Array.from(pinned).map(el => el.textContent || "").join("\n");
    runCopyAction(text, () => showCopyFeedback(btn, "Copy selected"), "Failed to copy selected code.");
  };
}

export function createClearSelectedHandler(
  lastPinned: Map<Element, number>,
  activeWrapperRef: React.MutableRefObject<Element | null>
) {
  return (e: Event) => {
    const btn = findClosestBtn(e, SELECTOR_CLEAR_SELECTED_BTN);

    if (!btn) return;

    const wrapper = btn.closest(SELECTOR_CODE_WRAPPER);

    if (!wrapper) return;

    wrapper.querySelectorAll(`.${LINE_PINNED_CLASS}`).forEach(el => el.classList.remove(LINE_PINNED_CLASS));

    const bar = wrapper.querySelector(".copy-selected-bar") as HTMLElement;

    if (bar) bar.style.display = "none";

    const headerLabel = wrapper.querySelector(".code-selection-label") as HTMLElement;

    if (headerLabel) headerLabel.style.display = "none";

    lastPinned.delete(wrapper);

    if (activeWrapperRef.current === wrapper) activeWrapperRef.current = null;
  };
}
