import { Search, X, ArrowUp, ArrowDown, CornerDownLeft } from "lucide-react";
import { ResultCountBadge } from "./ResultCountBadge";
import type { SearchResult } from "./searchFiles";

interface SearchInputBarProps {
  inputRef: React.RefObject<HTMLInputElement>;
  query: string;
  onQueryChange: (q: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  resultCount: number;
}

function InputActions({ query, resultCount, onClear }: { query: string; resultCount: number; onClear: () => void }) {
  return (
    <>
      {query && resultCount > 0 && <ResultCountBadge count={resultCount} />}
      {query && (
        <button onClick={onClear} className="p-1 rounded-md hover:bg-muted/60 text-muted-foreground">
          <X className="h-3.5 w-3.5" />
        </button>
      )}
      <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded border border-border bg-muted text-[10px] font-mono text-muted-foreground">
        ESC
      </kbd>
    </>
  );
}

export function SearchInputBar({ inputRef, query, onQueryChange, onKeyDown, resultCount }: SearchInputBarProps) {
  return (
    <div className="flex items-center gap-3 px-4 border-b border-border">
      <Search className="h-4 w-4 text-muted-foreground shrink-0" />
      <input
        ref={inputRef}
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Search across all documentation…"
        className="flex-1 h-12 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
      />
      <InputActions query={query} resultCount={resultCount} onClear={() => onQueryChange("")} />
    </div>
  );
}

interface SearchFooterProps {
  resultCount: number;
  showRecent: boolean;
}

function FooterContent({ resultCount, showRecent }: SearchFooterProps) {
  return (
    <div className="flex items-center gap-4 px-4 py-2 border-t border-border text-xs text-muted-foreground">
      <span className="flex items-center gap-1">
        <ArrowUp className="h-3 w-3" /><ArrowDown className="h-3 w-3" /> navigate
      </span>
      <span className="flex items-center gap-1">
        <CornerDownLeft className="h-3 w-3" /> {showRecent ? "use" : "open"}
      </span>
      {resultCount > 0 && (
        <span className="ml-auto">{resultCount} result{resultCount !== 1 ? "s" : ""}</span>
      )}
    </div>
  );
}

export function SearchFooter({ resultCount, showRecent }: SearchFooterProps) {
  const isVisible = resultCount > 0 || showRecent;

  if (!isVisible) {
    return null;
  }

  return <FooterContent resultCount={resultCount} showRecent={showRecent} />;
}

interface SearchEmptyStatesProps {
  query: string;
  results: SearchResult[];
  fileCount: number;
  hasRecent: boolean;
}

function NoResultsState({ query }: { query: string }) {
  return (
    <div className="py-12 text-center">
      <Search className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
      <p className="text-sm text-muted-foreground">No results for "<span className="text-foreground font-medium">{query}</span>"</p>
      <p className="text-xs text-muted-foreground/60 mt-1">Try a different search term</p>
    </div>
  );
}

function InitialState({ fileCount }: { fileCount: number }) {
  return (
    <div className="py-12 text-center">
      <Search className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
      <p className="text-sm text-muted-foreground">Type to search across {fileCount} documentation files</p>
    </div>
  );
}

export function SearchEmptyStates({ query, results, fileCount, hasRecent }: SearchEmptyStatesProps) {
  if (query && results.length === 0) {
    return <NoResultsState query={query} />;
  }

  if (!query && !hasRecent) {
    return <InitialState fileCount={fileCount} />;
  }

  return null;
}
