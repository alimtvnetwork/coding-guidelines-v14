/**
 * Hook that wires up all code block event handlers.
 * Each handler group is in a separate file for maintainability.
 */
import { useEffect, useRef } from "react";
import type { DragState } from "./codeBlockDomHelpers";
import {
  createCopyHandler, createDownloadHandler, createFullscreenHandler,
  createChecklistCopyHandler, createChecklistExportHandler, createCopySelectedHandler, createClearSelectedHandler,
} from "./codeBlockActionHandlers";
import {
  createLineClickHandler, createLineKeyHandler,
} from "./codeBlockLineHandlers";
import {
  createDragStartHandler, createDragMoveHandler, createDragEndHandler,
  createLineHoverHandler, createLineLeaveHandler, createFontHandler,
} from "./codeBlockDragHandlers";

interface SetFullscreenBlock {
  (updater: (prev: string | null) => string | null): void;
}

export function useCodeBlockEvents(
  containerRef: React.RefObject<HTMLDivElement>,
  html: string,
  setFullscreenBlock: SetFullscreenBlock
): void {
  const activeWrapperRef = useRef<Element | null>(null);
  const anchorIdxRef = useRef(0);
  const cursorIdxRef = useRef(0);
  const lastPinnedRef = useRef(new Map<Element, number>());
  const dragStateRef = useRef<DragState | null>(null);

  useEffect(() => {

    if (!containerRef.current) return;

    const el = containerRef.current;
    const lastPinned = lastPinnedRef.current;
    const pinRefs = { activeWrapperRef, anchorIdxRef, cursorIdxRef, lastPinned };

    const handlers = buildHandlers(el, pinRefs, dragStateRef, lastPinned, setFullscreenBlock);

    attachListeners(el, handlers);

    return () => detachListeners(el, handlers);
  }, [html, setFullscreenBlock]);
}

interface Handlers {
  copy: (e: Event) => void;
  download: (e: Event) => void;
  fullscreen: (e: Event) => void;
  font: (e: Event) => void;
  checklistCopy: (e: Event) => void;
  checklistExport: (e: Event) => void;
  lineClick: (e: Event) => void;
  copySelected: (e: Event) => void;
  clearSelected: (e: Event) => void;
  dragStart: (e: Event) => void;
  dragMove: (e: Event) => void;
  dragEnd: () => void;
  lineKey: (e: KeyboardEvent) => void;
  lineHover: (e: Event) => void;
  lineLeave: (e: Event) => void;
}

function buildActionHandlers(setFullscreenBlock: SetFullscreenBlock): Pick<Handlers, "copy" | "download" | "fullscreen" | "checklistCopy" | "checklistExport" | "copySelected"> {
  return {
    copy: createCopyHandler(),
    download: createDownloadHandler(),
    fullscreen: createFullscreenHandler(setFullscreenBlock),
    checklistCopy: createChecklistCopyHandler(),
    checklistExport: createChecklistExportHandler(),
    copySelected: createCopySelectedHandler(),
  };
}

function buildLineHandlers(
  el: HTMLElement,
  pinRefs: Parameters<typeof createLineClickHandler>[0],
  dragStateRef: React.MutableRefObject<DragState | null>,
  lastPinned: Map<Element, number>
): Pick<Handlers, "font" | "lineClick" | "clearSelected" | "dragStart" | "dragMove" | "dragEnd" | "lineKey" | "lineHover" | "lineLeave"> {
  return {
    font: createFontHandler(el),
    lineClick: createLineClickHandler(pinRefs),
    clearSelected: createClearSelectedHandler(lastPinned, pinRefs.activeWrapperRef),
    dragStart: createDragStartHandler(dragStateRef, lastPinned),
    dragMove: createDragMoveHandler(dragStateRef, lastPinned),
    dragEnd: createDragEndHandler(dragStateRef),
    lineKey: createLineKeyHandler(pinRefs),
    lineHover: createLineHoverHandler(),
    lineLeave: createLineLeaveHandler(),
  };
}

function buildHandlers(
  el: HTMLElement,
  pinRefs: Parameters<typeof createLineClickHandler>[0],
  dragStateRef: React.MutableRefObject<DragState | null>,
  lastPinned: Map<Element, number>,
  setFullscreenBlock: SetFullscreenBlock
): Handlers {
  return {
    ...buildActionHandlers(setFullscreenBlock),
    ...buildLineHandlers(el, pinRefs, dragStateRef, lastPinned),
  };
}

function attachListeners(el: HTMLElement, h: Handlers): void {
  el.addEventListener("click", h.copy);
  el.addEventListener("click", h.download);
  el.addEventListener("click", h.fullscreen);
  el.addEventListener("click", h.font);
  el.addEventListener("click", h.checklistCopy);
  el.addEventListener("click", h.checklistExport);
  el.addEventListener("click", h.lineClick);
  el.addEventListener("click", h.copySelected);
  el.addEventListener("click", h.clearSelected);
  el.addEventListener("mousedown", h.dragStart);
  el.addEventListener("mouseover", h.lineHover);
  el.addEventListener("mouseout", h.lineLeave);
  document.addEventListener("mousemove", h.dragMove);
  document.addEventListener("mouseup", h.dragEnd);
  document.addEventListener("keydown", h.lineKey);
}

function detachListeners(el: HTMLElement, h: Handlers): void {
  el.removeEventListener("click", h.copy);
  el.removeEventListener("click", h.download);
  el.removeEventListener("click", h.fullscreen);
  el.removeEventListener("click", h.font);
  el.removeEventListener("click", h.checklistCopy);
  el.removeEventListener("click", h.checklistExport);
  el.removeEventListener("click", h.lineClick);
  el.removeEventListener("click", h.copySelected);
  el.removeEventListener("click", h.clearSelected);
  el.removeEventListener("mousedown", h.dragStart);
  el.removeEventListener("mouseover", h.lineHover);
  el.removeEventListener("mouseout", h.lineLeave);
  document.removeEventListener("mousemove", h.dragMove);
  document.removeEventListener("mouseup", h.dragEnd);
  document.removeEventListener("keydown", h.lineKey);
}
