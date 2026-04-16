/**
 * Line selection (pin, range, click, keyboard) handlers for code blocks.
 */
import {
  LINE_PINNED_CLASS,
  SELECTOR_CODE_WRAPPER, SELECTOR_CODE_LINE,
  SELECTOR_TOOL_EXCLUSIONS,
  INPUT_TAG, TEXTAREA_TAG,
  applyHighlight, getLineIndex,
} from "./codeBlockDomHelpers";

const ARROW_DOWN = "ArrowDown";
const ARROW_UP = "ArrowUp";

export function clearPinnedLines(wrapper: Element): void {
  wrapper.querySelectorAll(`.${LINE_PINNED_CLASS}`).forEach(el => el.classList.remove(LINE_PINNED_CLASS));
}

function hideSelectionUi(bar: HTMLElement | null, headerLabel: HTMLElement | null): void {

  if (bar) bar.style.display = "none";

  if (headerLabel) headerLabel.style.display = "none";
}

function showSelectionUi(bar: HTMLElement | null, headerLabel: HTMLElement | null, text: string): void {
  const label = bar?.querySelector(".copy-selected-label") as HTMLElement;

  if (label) label.textContent = text;

  if (bar) bar.style.display = "flex";

  if (headerLabel) {
    headerLabel.textContent = text;
    headerLabel.style.display = "inline";
  }
}

export function updateSelectedBar(wrapper: Element): void {
  const bar = wrapper.querySelector(".copy-selected-bar") as HTMLElement;
  const headerLabel = wrapper.querySelector(".code-selection-label") as HTMLElement;
  const pinned = wrapper.querySelectorAll(`${SELECTOR_CODE_LINE}.${LINE_PINNED_CLASS}`);

  if (pinned.length === 0) {
    hideSelectionUi(bar, headerLabel);

    return;
  }

  const indices = Array.from(pinned).map(el => parseInt((el as HTMLElement).dataset.line || "0", 10));
  const from = Math.min(...indices);
  const to = Math.max(...indices);
  const isSingleLine = from === to;
  const text = isSingleLine ? `Line ${from}` : `Lines ${from}–${to}`;

  showSelectionUi(bar, headerLabel, text);
}

interface PinOpts {
  wrapper: Element;
  lastPinned: Map<Element, number>;
}

export function pinRange(from: number, to: number, opts: PinOpts): void {
  clearPinnedLines(opts.wrapper);
  const lo = Math.min(from, to);
  const hi = Math.max(from, to);

  for (let i = lo; i <= hi; i++) {
    applyHighlight(opts.wrapper, i, LINE_PINNED_CLASS);
  }

  opts.lastPinned.set(opts.wrapper, from);
  updateSelectedBar(opts.wrapper);
}

export interface PinRefs {
  activeWrapperRef: React.MutableRefObject<Element | null>;
  anchorIdxRef: React.MutableRefObject<number>;
  cursorIdxRef: React.MutableRefObject<number>;
  lastPinned: Map<Element, number>;
}

function pinSingle(wrapper: Element, idx: number, refs: PinRefs): void {
  clearPinnedLines(wrapper);
  applyHighlight(wrapper, idx, LINE_PINNED_CLASS);
  refs.lastPinned.set(wrapper, idx);
  refs.activeWrapperRef.current = wrapper;
  refs.anchorIdxRef.current = idx;
  refs.cursorIdxRef.current = idx;
  updateSelectedBar(wrapper);
}

function scrollLineIntoView(wrapper: Element, idx: number): void {
  const lines = wrapper.querySelectorAll(SELECTOR_CODE_LINE);

  if (lines[idx]) (lines[idx] as HTMLElement).scrollIntoView({ block: "nearest" });
}

function isInputTarget(target: HTMLElement): boolean {
  return target.tagName === INPUT_TAG || target.tagName === TEXTAREA_TAG || target.isContentEditable;
}

function handleShiftClick(wrapper: Element, idx: number, refs: PinRefs): void {
  refs.anchorIdxRef.current = refs.lastPinned.get(wrapper)!;
  refs.cursorIdxRef.current = idx;
  refs.activeWrapperRef.current = wrapper;
  pinRange(refs.anchorIdxRef.current, refs.cursorIdxRef.current, { wrapper, lastPinned: refs.lastPinned });
}

export function createLineClickHandler(refs: PinRefs) {
  return (e: Event) => {
    const me = e as MouseEvent;
    const target = me.target as HTMLElement;
    const wrapper = target.closest(SELECTOR_CODE_WRAPPER);

    if (!wrapper) return;

    if (target.closest(SELECTOR_TOOL_EXCLUSIONS)) return;

    const idx = getLineIndex(target, wrapper);

    if (idx < 0) return;

    const isShiftRange = me.shiftKey && refs.lastPinned.has(wrapper);

    if (isShiftRange) return handleShiftClick(wrapper, idx, refs);

    pinSingle(wrapper, idx, refs);
  };
}

function handleShiftArrow(refs: PinRefs, totalLines: number, delta: number): void {
  const newCursor = Math.max(0, Math.min(totalLines - 1, refs.cursorIdxRef.current + delta));

  if (newCursor === refs.cursorIdxRef.current) return;

  refs.cursorIdxRef.current = newCursor;
  pinRange(refs.anchorIdxRef.current, refs.cursorIdxRef.current, { wrapper: refs.activeWrapperRef.current!, lastPinned: refs.lastPinned });
}

function handleSingleArrow(refs: PinRefs, totalLines: number, delta: number): void {
  const newIdx = Math.max(0, Math.min(totalLines - 1, refs.cursorIdxRef.current + delta));

  if (newIdx === refs.cursorIdxRef.current) return;

  pinSingle(refs.activeWrapperRef.current!, newIdx, refs);
}

export function createLineKeyHandler(refs: PinRefs) {
  return (e: KeyboardEvent) => {

    if (!refs.activeWrapperRef.current) return;

    const isArrowKey = e.key === ARROW_UP || e.key === ARROW_DOWN;

    if (!isArrowKey) return;

    if (isInputTarget(e.target as HTMLElement)) return;

    const totalLines = refs.activeWrapperRef.current.querySelectorAll(SELECTOR_CODE_LINE).length;

    if (totalLines === 0) return;

    e.preventDefault();
    const delta = e.key === ARROW_DOWN ? 1 : -1;

    if (e.shiftKey) {
      handleShiftArrow(refs, totalLines, delta);
    } else {
      handleSingleArrow(refs, totalLines, delta);
    }

    scrollLineIntoView(refs.activeWrapperRef.current, refs.cursorIdxRef.current);
  };
}
