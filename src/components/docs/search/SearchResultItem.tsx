import { useEffect, useRef } from "react";
import { FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { HighlightedText } from "./HighlightedText";
import type { SearchResult } from "./searchFiles";

interface SearchResultItemProps {
  result: SearchResult;
  query: string;
  isActive: boolean;
  onSelect: () => void;
  onHover: () => void;
}

function buildPathDisplay(path: string): string {
  return path
    .split("/")
    .slice(0, -1)
    .map((s) => s.replace(/^\d+-/, ""))
    .join(" › ");
}

function SnippetList({ snippets, snippetHighlights, query }: { snippets: string[]; snippetHighlights?: number[][]; query: string }) {
  if (snippets.length === 0) {
    return null;
  }

  return (
    <div className="mt-1.5 space-y-1">
      {snippets.map((snippet, i) => (
        <div key={i} className="text-xs text-muted-foreground/80 leading-relaxed line-clamp-2 border-l-2 border-border ml-0.5 pl-2">
          <HighlightedText text={snippet} query={query} highlightIndices={snippetHighlights?.[i]} />
        </div>
      ))}
    </div>
  );
}

function ResultContent({ result, query }: { result: SearchResult; query: string }) {
  const pathDisplay = buildPathDisplay(result.file.path);

  return (
    <div className="min-w-0 flex-1">
      <div className="text-sm font-medium truncate">
        <HighlightedText text={result.file.name} query={query} />
      </div>
      <div className="text-xs text-muted-foreground truncate mt-0.5">{pathDisplay}</div>
      <SnippetList snippets={result.snippets} snippetHighlights={result.snippetHighlights} query={query} />
    </div>
  );
}

function useScrollIntoView(ref: React.RefObject<HTMLButtonElement>, isActive: boolean): void {
  useEffect(() => {
    if (isActive) {
      ref.current?.scrollIntoView({ block: "nearest" });
    }
  }, [isActive]);
}

interface ResultButtonProps {
  refEl: React.RefObject<HTMLButtonElement>;
  isActive: boolean;
  onSelect: () => void;
  onHover: () => void;
  children: React.ReactNode;
}

function resultButtonClass(isActive: boolean): string {
  const base = "w-full text-left px-3 py-2.5 rounded-lg transition-colors duration-100 group/item";
  const active = "bg-primary/10 border border-primary/20";
  const inactive = "hover:bg-muted/60 border border-transparent";

  return cn(base, isActive ? active : inactive);
}

function ResultButton({ refEl, isActive, onSelect, onHover, children }: ResultButtonProps) {
  return (
    <button ref={refEl} onClick={onSelect} onMouseEnter={onHover} className={resultButtonClass(isActive)}>
      {children}
    </button>
  );
}

export function SearchResultItem({ result, query, isActive, onSelect, onHover }: SearchResultItemProps) {
  const ref = useRef<HTMLButtonElement>(null);
  useScrollIntoView(ref, isActive);

  return (
    <ResultButton refEl={ref} isActive={isActive} onSelect={onSelect} onHover={onHover}>
      <div className="flex items-start gap-2.5">
        <FileText className={cn("h-4 w-4 mt-0.5 shrink-0", isActive ? "text-primary" : "text-muted-foreground")} />
        <ResultContent result={result} query={query} />
      </div>
    </ResultButton>
  );
}
