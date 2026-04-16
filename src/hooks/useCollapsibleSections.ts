import { useEffect, useCallback, useState, useRef } from "react";
import { saveCurrentState, restoreSavedState, hasCollapsedState } from "./collapsible/collapsibleState";
import { wrapSections } from "./collapsible/wrapSections";

function useSaveOnFileSwitch(
  containerRef: React.RefObject<HTMLDivElement>,
  filePath?: string
): void {
  const prevFileRef = useRef<string | undefined>(filePath);

  useEffect(() => {
    const container = containerRef.current;
    const hasPrevFile = prevFileRef.current && prevFileRef.current !== filePath;

    if (container && hasPrevFile) {
      saveCurrentState(container, prevFileRef.current!);
    }

    prevFileRef.current = filePath;
  }, [filePath]);
}

function applyBulkToggle(container: HTMLElement, isCollapsed: boolean, filePath?: string): void {
  container.querySelectorAll<HTMLElement>(".collapsible-section").forEach((section) => {
    section.classList.toggle("collapsed", isCollapsed);
  });

  if (filePath) {
    saveCurrentState(container, filePath);
  }
}

/**
 * Wraps each H2 section in the rendered markdown with a collapsible container.
 * Persists collapsed state per file path across file switches.
 */
export function useCollapsibleSections(
  containerRef: React.RefObject<HTMLDivElement>,
  html: string,
  allCollapsed: boolean | null,
  filePath?: string
): void {
  useSaveOnFileSwitch(containerRef, filePath);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    const sections = container.querySelectorAll<HTMLElement>(".collapsible-section");

    if (sections.length === 0) {
      wrapSections(container, filePath);
    }

    if (allCollapsed !== null) {
      applyBulkToggle(container, allCollapsed, filePath);

      return;
    }

    if (filePath && hasCollapsedState(filePath)) {
      restoreSavedState(container, filePath);
    }
  }, [html, allCollapsed, filePath]);
}

export function useCollapsibleState() {
  const [allCollapsed, setAllCollapsed] = useState<boolean | null>(null);

  const collapseAll = useCallback(() => setAllCollapsed(true), []);
  const expandAll = useCallback(() => setAllCollapsed(false), []);
  const toggleAll = useCallback(() => {
    setAllCollapsed((prev) => (prev === true ? false : true));
  }, []);

  const resetCollapsible = useCallback(() => setAllCollapsed(null), []);

  return { allCollapsed, collapseAll, expandAll, toggleAll, resetCollapsible };
}
