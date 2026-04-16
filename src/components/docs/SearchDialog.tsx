import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import type { SpecNode } from "@/types/spec";
import { searchFiles } from "./search/searchFiles";
import type { SearchResult } from "./search/searchFiles";
import { loadRecent, saveRecent, addRecent } from "./search/recentSearches";
import { SearchResultItem } from "./search/SearchResultItem";
import { RecentSearches } from "./search/RecentSearches";
import { SearchInputBar, SearchFooter, SearchEmptyStates } from "./search/SearchParts";
import { useKeyboardNav } from "./search/useSearchKeyboard";

export { useSearchShortcut } from "./search/useSearchKeyboard";

const FOCUS_DELAY = 50;

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  allFiles: SpecNode[];
  onSelect: (node: SpecNode) => void;
}

function useResetOnOpen(open: boolean, setQuery: (q: string) => void, setActiveIndex: (i: number) => void, setRecent: (r: string[]) => void, inputRef: React.RefObject<HTMLInputElement>): void {
  useEffect(() => {
    if (!open) {
      return;
    }

    setQuery("");
    setActiveIndex(0);
    setRecent(loadRecent());
    setTimeout(() => inputRef.current?.focus(), FOCUS_DELAY);
  }, [open]);
}

interface SearchResultListProps {
  results: SearchResult[];
  query: string;
  activeIndex: number;
  onSelect: (idx: number) => void;
  onHover: (idx: number) => void;
}

function SearchResultList({ results, query, activeIndex, onSelect, onHover }: SearchResultListProps) {
  return (
    <>
      {results.map((result, i) => (
        <SearchResultItem key={result.file.path} result={result} query={query} isActive={i === activeIndex} onSelect={() => onSelect(i)} onHover={() => onHover(i)} />
      ))}
    </>
  );
}

function useSelectHandler(results: SearchResult[], query: string, onSelect: (node: SpecNode) => void, onOpenChange: (open: boolean) => void, setRecentSearches: (r: string[]) => void) {
  return useCallback((idx: number) => {
    const result = results[idx];

    if (!result) {
      return;
    }

    addRecent(query.trim());
    setRecentSearches(loadRecent());
    onSelect(result.file);
    onOpenChange(false);
  }, [onSelect, onOpenChange, query, results]);
}

function useRecentHandlers(setRecentSearches: (r: string[]) => void) {
  const handleClearRecent = useCallback(() => { saveRecent([]); setRecentSearches([]); }, []);

  const handleRemoveRecent = useCallback((q: string) => {
    const updated = loadRecent().filter((item) => item !== q);
    saveRecent(updated);
    setRecentSearches(updated);
  }, []);

  return { handleClearRecent, handleRemoveRecent };
}

function SearchDialogOverlay({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-card border border-border rounded-xl shadow-2xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200">
        {children}
      </div>
    </div>
  );
}

function useSearchDialogState(open: boolean, allFiles: SpecNode[], onSelect: (node: SpecNode) => void, onOpenChange: (open: boolean) => void) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const results = useMemo(() => searchFiles(allFiles, query), [allFiles, query]);
  const handleSelect = useSelectHandler(results, query, onSelect, onOpenChange, setRecentSearches);
  const recentHandlers = useRecentHandlers(setRecentSearches);
  const showRecent = !query && recentSearches.length > 0;
  const handleRecentSelect = useCallback((q: string) => setQuery(q), []);

  useResetOnOpen(open, setQuery, setActiveIndex, setRecentSearches, inputRef);
  useEffect(() => setActiveIndex(0), [query]);

  const handleKeyDown = useKeyboardNav(results.length, activeIndex, showRecent, recentSearches, handleRecentSelect, handleSelect, () => onOpenChange(false), setActiveIndex);

  return { query, setQuery, activeIndex, setActiveIndex, recentSearches, inputRef, results, handleSelect, recentHandlers, showRecent, handleRecentSelect, handleKeyDown };
}

export function SearchDialog({ open, onOpenChange, allFiles, onSelect }: SearchDialogProps) {
  const s = useSearchDialogState(open, allFiles, onSelect, onOpenChange);

  if (!open) {
    return null;
  }

  return (
    <SearchDialogOverlay onClose={() => onOpenChange(false)}>
      <SearchInputBar inputRef={s.inputRef} query={s.query} onQueryChange={s.setQuery} onKeyDown={s.handleKeyDown} resultCount={s.results.length} />
      <SearchDialogBody query={s.query} results={s.results} allFiles={allFiles} showRecent={s.showRecent} recentSearches={s.recentSearches} recentHandlers={s.recentHandlers} handleRecentSelect={s.handleRecentSelect} activeIndex={s.activeIndex} setActiveIndex={s.setActiveIndex} handleSelect={s.handleSelect} />
      <SearchFooter resultCount={s.results.length} showRecent={s.showRecent} />
    </SearchDialogOverlay>
  );
}

interface SearchDialogBodyProps {
  query: string;
  results: SearchResult[];
  allFiles: SpecNode[];
  showRecent: boolean;
  recentSearches: string[];
  recentHandlers: ReturnType<typeof useRecentHandlers>;
  handleRecentSelect: (q: string) => void;
  handleSelect: (idx: number) => void;
  activeIndex: number;
  setActiveIndex: (i: number) => void;
}

function SearchDialogBody({ query, results, allFiles, showRecent, recentSearches, recentHandlers, handleRecentSelect, handleSelect, activeIndex, setActiveIndex }: SearchDialogBodyProps) {
  return (
    <div className="max-h-[50vh] overflow-auto p-2">
      <SearchEmptyStates query={query} results={results} fileCount={allFiles.length} hasRecent={recentSearches.length > 0} />
      {showRecent && <RecentSearches recent={recentSearches} onSelect={handleRecentSelect} onClearAll={recentHandlers.handleClearRecent} onRemove={recentHandlers.handleRemoveRecent} activeIndex={activeIndex} onHover={setActiveIndex} />}
      <SearchResultList results={results} query={query} activeIndex={activeIndex} onSelect={handleSelect} onHover={setActiveIndex} />
    </div>
  );
}
