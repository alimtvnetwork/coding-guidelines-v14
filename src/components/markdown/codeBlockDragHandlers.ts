/**
 * Drag-select, hover-highlight, and font-size handlers for code blocks.
 */
import {
  LINE_PINNED_CLASS, LINE_HIGHLIGHT_CLASS,
  SELECTOR_CODE_WRAPPER, SELECTOR_CODE_LINE, SELECTOR_LINE_NUMBER,
  applyHighlight, getLineIndex,
  type DragState,
} from "./codeBlockDomHelpers";
import {
  DEFAULT_FONT_SIZE, MIN_FONT_SIZE, MAX_FONT_SIZE, FONT_SIZE_STEP,
} from "./constants";
import { clearPinnedLines, pinRange, updateSelectedBar } from "./codeBlockLineHandlers";

export function createDragStartHandler(
  dragStateRef: React.MutableRefObject<DragState | null>,
  lastPinned: Map<Element, number>
) {
  return (e: Event) => {
    const me = e as MouseEvent;
    const lineNum = (me.target as HTMLElement).closest(SELECTOR_LINE_NUMBER) as HTMLElement;

    if (!lineNum) return;

    const wrapper = lineNum.closest(SELECTOR_CODE_WRAPPER);

    if (!wrapper) return;

    const idx = Array.from(wrapper.querySelectorAll(SELECTOR_LINE_NUMBER)).indexOf(lineNum);

    if (idx < 0) return;

    me.preventDefault();
    dragStateRef.current = { wrapper, anchor: idx };
    clearPinnedLines(wrapper);
    applyHighlight(wrapper, idx, LINE_PINNED_CLASS);
    updateSelectedBar(wrapper);
  };
}

function resolveDragIdx(target: HTMLElement, wrapper: Element): number {
  const lineNum = target.closest(SELECTOR_LINE_NUMBER) as HTMLElement;

  if (lineNum) {
    return Array.from(wrapper.querySelectorAll(SELECTOR_LINE_NUMBER)).indexOf(lineNum);
  }

  const codeLine = target.closest(SELECTOR_CODE_LINE) as HTMLElement;

  if (codeLine) {
    return parseInt(codeLine.dataset.line || "0", 10) - 1;
  }

  return -1;
}

export function createDragMoveHandler(
  dragStateRef: React.MutableRefObject<DragState | null>,
  lastPinned: Map<Element, number>
) {
  return (e: Event) => {

    if (!dragStateRef.current) return;

    const me = e as MouseEvent;
    const target = document.elementFromPoint(me.clientX, me.clientY) as HTMLElement;

    if (!target) return;

    const wrapper = target.closest(SELECTOR_CODE_WRAPPER);

    if (wrapper !== dragStateRef.current.wrapper) return;

    const idx = resolveDragIdx(target, wrapper);

    if (idx < 0) return;

    pinRange(dragStateRef.current.anchor, idx, { wrapper: dragStateRef.current.wrapper, lastPinned });
  };
}

export function createDragEndHandler(dragStateRef: React.MutableRefObject<DragState | null>) {
  return () => { dragStateRef.current = null; };
}

export function createLineHoverHandler() {
  return (e: Event) => {
    const target = e.target as HTMLElement;
    const wrapper = target.closest(SELECTOR_CODE_WRAPPER);

    if (!wrapper) return;

    const idx = getLineIndex(target, wrapper);

    if (idx < 0) return;

    applyHighlight(wrapper, idx, LINE_HIGHLIGHT_CLASS);
  };
}

export function createLineLeaveHandler() {
  return (e: Event) => {
    const wrapper = (e.target as HTMLElement).closest(SELECTOR_CODE_WRAPPER);

    if (!wrapper) return;

    wrapper.querySelectorAll(`.${LINE_HIGHLIGHT_CLASS}`).forEach(el => el.classList.remove(LINE_HIGHLIGHT_CLASS));
  };
}

export function createFontHandler(containerEl: HTMLElement) {
  return (e: Event) => {
    const btn = e.target as HTMLElement;
    const isIncrease = btn.closest(".font-increase-btn");
    const isDecrease = btn.closest(".font-decrease-btn");
    const isReset = btn.closest(".font-reset-btn");

    const matched = isIncrease || isDecrease || isReset;

    if (!matched) return;

    const blockId = (matched as HTMLElement).dataset.blockId;
    const wrapper = containerEl.querySelector(`[data-block-id="${blockId}"]`) as HTMLElement;

    if (!wrapper) return;

    const current = parseFloat(getComputedStyle(wrapper).getPropertyValue("--code-font-size")) || DEFAULT_FONT_SIZE;
    const newSize = computeFontSize(current, { isIncrease, isDecrease });

    wrapper.style.setProperty("--code-font-size", `${newSize}px`);
  };
}

function computeFontSize(current: number, flags: { isIncrease: Element | null; isDecrease: Element | null }): number {

  if (flags.isIncrease) return Math.min(current + FONT_SIZE_STEP, MAX_FONT_SIZE);

  if (flags.isDecrease) return Math.max(current - FONT_SIZE_STEP, MIN_FONT_SIZE);

  return DEFAULT_FONT_SIZE;
}
