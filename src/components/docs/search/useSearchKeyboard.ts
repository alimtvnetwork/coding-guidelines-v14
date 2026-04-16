import { useEffect, useCallback } from "react";
import { KeyboardKeyType } from "@/constants/enums";

function isSearchShortcut(e: KeyboardEvent): boolean {
  const hasModifier = e.metaKey || e.ctrlKey;

  return hasModifier && e.key === KeyboardKeyType.K;
}

/** Global Ctrl+K / Cmd+K listener hook */
export function useSearchShortcut(onOpen: () => void): void {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!isSearchShortcut(e)) {
        return;
      }

      e.preventDefault();
      onOpen();
    };

    window.addEventListener("keydown", handler);

    return () => window.removeEventListener("keydown", handler);
  }, [onOpen]);
}

interface KeyboardNavConfig {
  maxIndex: number;
  onArrowDown: () => void;
  onArrowUp: () => void;
  onEnter: () => void;
  onEscape: () => void;
}

export function handleSearchKeyDown(e: React.KeyboardEvent, config: KeyboardNavConfig): void {
  if (e.key === KeyboardKeyType.ArrowDown) {
    e.preventDefault();
    config.onArrowDown();

    return;
  }

  if (e.key === KeyboardKeyType.ArrowUp) {
    e.preventDefault();
    config.onArrowUp();

    return;
  }

  if (e.key === KeyboardKeyType.Enter) {
    e.preventDefault();
    config.onEnter();

    return;
  }

  if (e.key === KeyboardKeyType.Escape) {
    config.onEscape();
  }
}

function buildEnterHandler(
  showRecent: boolean,
  recentSearches: string[],
  activeIndex: number,
  handleRecentSelect: (q: string) => void,
  handleSelect: (idx: number) => void,
  resultCount: number
): () => void {
  return () => {
    if (showRecent && recentSearches[activeIndex]) {
      handleRecentSelect(recentSearches[activeIndex]);

      return;
    }

    if (activeIndex < resultCount) {
      handleSelect(activeIndex);
    }
  };
}

export function useKeyboardNav(
  resultCount: number,
  activeIndex: number,
  showRecent: boolean,
  recentSearches: string[],
  handleRecentSelect: (q: string) => void,
  handleSelect: (idx: number) => void,
  onClose: () => void,
  setActiveIndex: React.Dispatch<React.SetStateAction<number>>
): (e: React.KeyboardEvent) => void {
  return useCallback(
    (e: React.KeyboardEvent) => {
      const maxIdx = showRecent ? recentSearches.length - 1 : resultCount - 1;

      handleSearchKeyDown(e, {
        maxIndex: maxIdx,
        onArrowDown: () => setActiveIndex((i) => Math.min(i + 1, maxIdx)),
        onArrowUp: () => setActiveIndex((i) => Math.max(i - 1, 0)),
        onEnter: buildEnterHandler(showRecent, recentSearches, activeIndex, handleRecentSelect, handleSelect, resultCount),
        onEscape: onClose,
      });
    },
    [resultCount, activeIndex, showRecent, recentSearches, handleRecentSelect, handleSelect, onClose, setActiveIndex]
  );
}
