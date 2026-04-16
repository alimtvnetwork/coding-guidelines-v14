/**
 * Keyboard navigation hook for DocsViewer.
 */
import { useEffect } from "react";
import type { SpecNode } from "@/types/spec";

const NODE_TYPE_FILE = "file";
const KEY_QUESTION = "?";
const KEY_F = "f";
const KEY_E = "e";
const KEY_S = "s";
const KEY_P = "p";
const KEY_ESCAPE = "Escape";
const KEY_ARROW_RIGHT = "ArrowRight";
const KEY_ARROW_LEFT = "ArrowLeft";
const KEY_ARROW_DOWN = "ArrowDown";
const KEY_ARROW_UP = "ArrowUp";
const INPUT_TAG = "INPUT";
const TEXTAREA_TAG = "TEXTAREA";

const VIEW_PREVIEW: ViewMode = "preview";
const VIEW_EDIT: ViewMode = "edit";
const VIEW_SPLIT: ViewMode = "split";

type ViewMode = "preview" | "edit" | "split";

interface FolderGroup {
  folderPath: string;
  startIndex: number;
  endIndex: number;
}

interface OrderedFile {
  file: SpecNode;
  folderPath: string;
}

interface KeyboardNavOptions {
  currentIndex: number;
  orderedFiles: OrderedFile[];
  folderGroups: FolderGroup[];
  onSelect: (node: SpecNode) => void;
  isFullscreen: boolean;
  showShortcuts: boolean;
  activeFile: SpecNode | null;
  setIsFullscreen: React.Dispatch<React.SetStateAction<boolean>>;
  setShowShortcuts: React.Dispatch<React.SetStateAction<boolean>>;
  setViewMode: React.Dispatch<React.SetStateAction<ViewMode>>;
  setEditContent: React.Dispatch<React.SetStateAction<string>>;
}

function isInputElement(target: HTMLElement): boolean {
  return target.tagName === INPUT_TAG || target.tagName === TEXTAREA_TAG || target.isContentEditable;
}

function hasModifier(e: KeyboardEvent): boolean {
  return e.ctrlKey || e.metaKey;
}

function ensureEditContent(activeFile: SpecNode, prev: ViewMode, setEditContent: React.Dispatch<React.SetStateAction<string>>): void {
  const isAlreadyEditing = prev === VIEW_EDIT || prev === VIEW_SPLIT;

  if (!isAlreadyEditing) {
    setEditContent(activeFile.content || "");
  }
}

function handleEditToggle(options: KeyboardNavOptions): void {
  options.setViewMode(prev => {
    ensureEditContent(options.activeFile!, prev, options.setEditContent);

    return prev === VIEW_EDIT ? VIEW_PREVIEW : VIEW_EDIT;
  });
}

function handleSplitToggle(options: KeyboardNavOptions): void {
  options.setViewMode(prev => {
    ensureEditContent(options.activeFile!, prev, options.setEditContent);

    return prev === VIEW_SPLIT ? VIEW_PREVIEW : VIEW_SPLIT;
  });
}

function handleHorizontalNav(key: string, options: KeyboardNavOptions): void {
  const { currentIndex, orderedFiles, folderGroups, onSelect } = options;
  const group = folderGroups.find(g => currentIndex >= g.startIndex && currentIndex <= g.endIndex);

  if (!group) return;

  const isRight = key === KEY_ARROW_RIGHT;
  const nextIdx = isRight
    ? (currentIndex < group.endIndex ? currentIndex + 1 : group.startIndex)
    : (currentIndex > group.startIndex ? currentIndex - 1 : group.endIndex);

  onSelect(orderedFiles[nextIdx].file);
}

function handleVerticalNav(key: string, options: KeyboardNavOptions): void {
  const { currentIndex, orderedFiles, folderGroups, onSelect } = options;
  const groupIdx = folderGroups.findIndex(g => currentIndex >= g.startIndex && currentIndex <= g.endIndex);

  if (groupIdx < 0) return;

  const isDown = key === KEY_ARROW_DOWN;
  const targetGroupIdx = isDown
    ? (groupIdx < folderGroups.length - 1 ? groupIdx + 1 : 0)
    : (groupIdx > 0 ? groupIdx - 1 : folderGroups.length - 1);

  onSelect(orderedFiles[folderGroups[targetGroupIdx].startIndex].file);
}

function handleEscapeKey(options: KeyboardNavOptions): void {

  if (options.showShortcuts) {
    options.setShowShortcuts(false);

    return;
  }

  if (options.isFullscreen) {
    options.setIsFullscreen(false);
  }
}

function handleToggleKeys(e: KeyboardEvent, options: KeyboardNavOptions): boolean {

  if (e.key === KEY_QUESTION) {
    e.preventDefault();
    options.setShowShortcuts(prev => !prev);

    return true;
  }

  if (e.key === KEY_F) {
    e.preventDefault();
    options.setIsFullscreen(prev => !prev);

    return true;
  }

  return false;
}

function handleViewModeKeys(e: KeyboardEvent, options: KeyboardNavOptions): boolean {

  if (!options.activeFile) return false;

  if (e.key === KEY_E) {
    e.preventDefault();
    handleEditToggle(options);

    return true;
  }

  if (e.key === KEY_S) {
    e.preventDefault();
    handleSplitToggle(options);

    return true;
  }

  if (e.key === KEY_P) {
    e.preventDefault();
    options.setViewMode(VIEW_PREVIEW);

    return true;
  }

  return false;
}

function handleArrowKeys(e: KeyboardEvent, options: KeyboardNavOptions): void {

  if (options.currentIndex < 0 || options.orderedFiles.length === 0) return;

  const isHorizontal = e.key === KEY_ARROW_RIGHT || e.key === KEY_ARROW_LEFT;
  const isVertical = e.key === KEY_ARROW_DOWN || e.key === KEY_ARROW_UP;

  if (isHorizontal) {
    e.preventDefault();
    handleHorizontalNav(e.key, options);
  }

  if (isVertical) {
    e.preventDefault();
    handleVerticalNav(e.key, options);
  }
}

function handleKeyPress(e: KeyboardEvent, options: KeyboardNavOptions): void {

  if (handleToggleKeys(e, options)) return;

  if (handleViewModeKeys(e, options)) return;

  if (e.key === KEY_ESCAPE) {
    handleEscapeKey(options);

    return;
  }

  handleArrowKeys(e, options);
}

export function useDocsKeyboard(options: KeyboardNavOptions): void {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {

      if (isInputElement(e.target as HTMLElement)) return;

      if (hasModifier(e)) return;

      handleKeyPress(e, options);
    };

    window.addEventListener("keydown", handler);

    return () => window.removeEventListener("keydown", handler);
  }, [options]);
}

export function flattenFilesOrdered(nodes: SpecNode[]): OrderedFile[] {
  const result: OrderedFile[] = [];

  const walk = (items: SpecNode[], parentPath: string) => {
    for (const node of items) {

      if (node.type === NODE_TYPE_FILE) {
        result.push({ file: node, folderPath: parentPath });
      }

      if (node.children) {
        walk(node.children, node.path);
      }
    }

  };

  walk(nodes, "");

  return result;
}

function processFolderEntry(
  i: number,
  item: OrderedFile,
  state: { folder: string; startIdx: number },
  groups: FolderGroup[]
): void {
  const isSameFolder = i === 0 || item.folderPath === state.folder;

  if (isSameFolder) return;

  groups.push({ folderPath: state.folder, startIndex: state.startIdx, endIndex: i - 1 });
  state.folder = item.folderPath;
  state.startIdx = i;
}

export function buildFolderGroups(orderedFiles: OrderedFile[]): FolderGroup[] {

  if (orderedFiles.length === 0) return [];

  const state = { folder: orderedFiles[0].folderPath, startIdx: 0 };
  const groups: FolderGroup[] = [];

  orderedFiles.forEach((item, i) => processFolderEntry(i, item, state, groups));

  groups.push({ folderPath: state.folder, startIndex: state.startIdx, endIndex: orderedFiles.length - 1 });

  return groups;
}
