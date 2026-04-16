/**
 * Utility functions and hooks extracted from DocsViewer.
 */
import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useScrollSpy } from "@/hooks/useScrollSpy";
import { useTheme } from "@/components/ThemeProvider";
import { useDocsKeyboard, flattenFilesOrdered, buildFolderGroups } from "@/hooks/useDocsKeyboard";
import { copyTextToClipboard } from "@/lib/clipboard";
import type { SpecNode } from "@/types/spec";
import { ViewModeType, SpecEntryType, type ViewMode } from "@/constants/enums";

export const COPY_FEEDBACK_DELAY = 2000;
export const SPLIT_MIN_RATIO = 20;
export const SPLIT_MAX_RATIO = 80;

function createDragHandlers(isDragging: React.MutableRefObject<boolean>, splitContainerRef: React.RefObject<HTMLDivElement>, setSplitRatio: React.Dispatch<React.SetStateAction<number>>) {
  const onMouseMove = (ev: MouseEvent) => {

    if (!isDragging.current || !splitContainerRef.current) return;

    const rect = splitContainerRef.current.getBoundingClientRect();
    const ratio = ((ev.clientX - rect.left) / rect.width) * 100;
    setSplitRatio(Math.max(SPLIT_MIN_RATIO, Math.min(SPLIT_MAX_RATIO, ratio)));
  };

  const onMouseUp = () => {
    isDragging.current = false;
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", onMouseUp);
  };

  return { onMouseMove, onMouseUp };
}

export function useSplitDivider(splitContainerRef: React.RefObject<HTMLDivElement>, setSplitRatio: React.Dispatch<React.SetStateAction<number>>) {
  const isDragging = useRef(false);

  return useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    const { onMouseMove, onMouseUp } = createDragHandlers(isDragging, splitContainerRef, setSplitRatio);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  }, [splitContainerRef, setSplitRatio]);
}

export function buildBreadcrumb(path: string): string[] {
  return path.split("/").map((seg) => {
    const name = seg.replace(/^\d+-/, "").replace(/-/g, " ").replace(/\.md$/, "");

    return name.charAt(0).toUpperCase() + name.slice(1);
  });
}

export function scrollToHeading(mainEl: HTMLElement, id: string): void {
  const headings = mainEl.querySelectorAll("h1, h2, h3, h4");

  for (const h of headings) {
    const text = (h.textContent || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    if (text === id) {
      h.scrollIntoView({ behavior: "smooth", block: "start" });
      break;
    }
  }
}

export function useReadingProgress(mainRef: React.RefObject<HTMLElement>, activeFile: SpecNode | null) {
  const [readingProgress, setReadingProgress] = useState(0);

  useEffect(() => {
    const mainEl = mainRef.current;

    if (!mainEl || !activeFile) { setReadingProgress(0); return; }

    const onScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = mainEl;
      const max = scrollHeight - clientHeight;
      setReadingProgress(max > 0 ? Math.min(scrollTop / max, 1) : 0);
    };

    mainEl.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => mainEl.removeEventListener("scroll", onScroll);
  }, [activeFile]);

  return readingProgress;
}

export function useViewState() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewModeType.Preview);
  const [editContent, setEditContent] = useState("");

  return { isFullscreen, setIsFullscreen, showShortcuts, setShowShortcuts, copied, setCopied, viewMode, setViewMode, editContent, setEditContent };
}

export function useSplitState() {
  const [splitRatio, setSplitRatio] = useState(50);
  const splitContainerRef = useRef<HTMLDivElement>(null);

  return { splitRatio, setSplitRatio, splitContainerRef };
}

function useDocsNavigation(tree: SpecNode[], activeFile: SpecNode | null) {
  const orderedFiles = useMemo(() => flattenFilesOrdered(tree), [tree]);
  const currentIndex = useMemo(() => {

    if (!activeFile) return -1;

    return orderedFiles.findIndex(f => f.file.path === activeFile.path);
  }, [activeFile, orderedFiles]);
  const folderGroups = useMemo(() => buildFolderGroups(orderedFiles), [orderedFiles]);

  return { orderedFiles, currentIndex, folderGroups };
}

export function useCopyMarkdown(activeFile: SpecNode | null, setCopied: (v: boolean) => void) {
  return useCallback(() => {

    if (!activeFile?.content) return;

    void copyTextToClipboard(activeFile.content)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), COPY_FEEDBACK_DELAY);
      })
      .catch((error) => {
        console.error("Failed to copy markdown.", error);
      });
  }, [activeFile, setCopied]);
}

export interface ContentPanelInput {
  state: ReturnType<typeof useViewState>;
  split: ReturnType<typeof useSplitState>;
  activeFile: SpecNode | null;
  tree: SpecNode[];
  onSelect: (node: SpecNode) => void;
  allFiles: SpecNode[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export interface ContentPanelDeps {
  mainRef: React.RefObject<HTMLElement>;
  readingProgress: number;
  handleDividerMouseDown: (e: React.MouseEvent) => void;
  handleCopyMarkdown: () => void;
  breadcrumb: string[];
  handleScrollTo: (id: string) => void;
  activeHeadingId: string | undefined;
  theme: string;
  toggleTheme: () => void;
}

function buildKeyboardInput(nav: ReturnType<typeof useDocsNavigation>, input: ContentPanelInput) {
  const { state, activeFile, onSelect } = input;

  return {
    currentIndex: nav.currentIndex, orderedFiles: nav.orderedFiles, folderGroups: nav.folderGroups, onSelect,
    isFullscreen: state.isFullscreen, showShortcuts: state.showShortcuts, activeFile,
    setIsFullscreen: state.setIsFullscreen, setShowShortcuts: state.setShowShortcuts, setViewMode: state.setViewMode, setEditContent: state.setEditContent,
  };
}

export function useContentPanelDeps(input: ContentPanelInput): ContentPanelDeps {
  const { state, split, activeFile, tree } = input;
  const { theme, toggleTheme } = useTheme();
  const mainRef = useRef<HTMLElement>(null);
  const nav = useDocsNavigation(tree, activeFile);
  useDocsKeyboard(buildKeyboardInput(nav, input));

  const readingProgress = useReadingProgress(mainRef, activeFile);
  const activeHeadingId = useScrollSpy(mainRef, activeFile?.content);
  const handleDividerMouseDown = useSplitDivider(split.splitContainerRef, split.setSplitRatio);
  const handleCopyMarkdown = useCopyMarkdown(activeFile, state.setCopied);
  const breadcrumb = activeFile ? buildBreadcrumb(activeFile.path) : [];
  const handleScrollTo = useCallback((id: string) => { if (!mainRef.current) return; scrollToHeading(mainRef.current, id); }, []);

  return { mainRef, readingProgress, handleDividerMouseDown, handleCopyMarkdown, breadcrumb, handleScrollTo, activeHeadingId, theme, toggleTheme };
}

export function useDeepLinkFile(allFiles: SpecNode[], setActiveFile: (f: SpecNode) => void): void {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const filePath = params.get("file");

    if (!filePath || allFiles.length === 0) return;

    const matchedFile = allFiles.find(f => f.path === filePath);

    if (!matchedFile) return;

    setActiveFile(matchedFile);
    window.history.replaceState({}, "", "/docs");
  }, [allFiles]);
}

export function useFileSelection(setActiveFile: (f: SpecNode | null) => void, setSearchQuery: (q: string) => void) {
  return useCallback((node: SpecNode) => {

    if (node.type !== SpecEntryType.File) return;

    setActiveFile(node);
    setSearchQuery("");
  }, []);
}
