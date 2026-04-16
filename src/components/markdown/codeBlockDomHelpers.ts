/**
 * DOM query helpers and shared types for code block event handlers.
 */

export const COPIED_FEEDBACK_COLOR = "hsl(152 70% 50%)";
export const LINE_PINNED_CLASS = "line-pinned";
export const LINE_HIGHLIGHT_CLASS = "line-highlight";

export const SELECTOR_COPY_BTN = ".copy-code-btn";
export const SELECTOR_DOWNLOAD_BTN = ".download-code-btn";
export const SELECTOR_FULLSCREEN_BTN = ".fullscreen-code-btn";
export const SELECTOR_CHECKLIST_COPY_BTN = ".checklist-copy-btn";
export const SELECTOR_CHECKLIST_EXPORT_BTN = ".checklist-export-btn";
export const SELECTOR_COPY_SELECTED_BTN = ".copy-selected-btn";
export const SELECTOR_CLEAR_SELECTED_BTN = ".clear-selected-btn";
export const SELECTOR_CODE_WRAPPER = ".code-block-wrapper";
export const SELECTOR_TOOL_EXCLUSIONS = ".code-tool-btn, .code-font-controls, .copy-selected-bar";
export const SELECTOR_LINE_NUMBER = ".code-line-number";
export const SELECTOR_CODE_LINE = ".code-line";

export const INPUT_TAG = "INPUT";
export const TEXTAREA_TAG = "TEXTAREA";

export interface DragState {
  wrapper: Element;
  anchor: number;
}

export function decodeEscaped(code: string): string {
  return code
    .replace(/&#10;/g, "\n")
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"');
}

export function getLineIndex(target: HTMLElement, wrapper: Element): number {
  const codeLine = target.closest(SELECTOR_CODE_LINE) as HTMLElement;

  if (codeLine) {
    return parseInt(codeLine.dataset.line || "0", 10) - 1;
  }

  const lineNum = target.closest(SELECTOR_LINE_NUMBER) as HTMLElement;

  if (lineNum) {
    return Array.from(wrapper.querySelectorAll(SELECTOR_LINE_NUMBER)).indexOf(lineNum);
  }

  return -1;
}

export function applyHighlight(wrapper: Element, idx: number, cls: string): void {
  const nums = wrapper.querySelectorAll(SELECTOR_LINE_NUMBER);
  const lines = wrapper.querySelectorAll(SELECTOR_CODE_LINE);

  if (nums[idx]) nums[idx].classList.add(cls);

  if (lines[idx]) lines[idx].classList.add(cls);
}

export function findClosestBtn(e: Event, selector: string): HTMLButtonElement | null {
  return (e.target as HTMLElement).closest(selector) as HTMLButtonElement | null;
}
