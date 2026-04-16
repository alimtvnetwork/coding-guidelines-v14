import { Clock, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface RecentSearchesProps {
  recent: string[];
  onSelect: (q: string) => void;
  onClearAll: () => void;
  onRemove: (q: string) => void;
  activeIndex: number;
  onHover: (i: number) => void;
}

function RecentSearchHeader({ onClearAll }: { onClearAll: () => void }) {
  return (
    <div className="flex items-center justify-between px-3 py-1.5">
      <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
        <Clock className="h-3 w-3" /> Recent searches
      </span>
      <button
        onClick={onClearAll}
        className="text-[10px] text-muted-foreground/60 hover:text-destructive transition-colors flex items-center gap-1"
      >
        <Trash2 className="h-2.5 w-2.5" /> Clear all
      </button>
    </div>
  );
}

interface RecentItemProps {
  query: string;
  isActive: boolean;
  onSelect: () => void;
  onHover: () => void;
  onRemove: () => void;
}

function RemoveButton({ onRemove }: { onRemove: () => void }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onRemove(); }}
      className="p-0.5 rounded opacity-0 group-hover/recent:opacity-100 hover:bg-muted text-muted-foreground hover:text-destructive transition-all"
    >
      <X className="h-3 w-3" />
    </button>
  );
}

function RecentItemButton({ query, isActive, onSelect, onHover, onRemove }: RecentItemProps) {
  return (
    <button
      onClick={onSelect}
      onMouseEnter={onHover}
      className={cn(
        "w-full text-left px-3 py-2 rounded-lg flex items-center gap-2.5 group/recent transition-colors duration-100",
        isActive ? "bg-primary/10 border border-primary/20" : "hover:bg-muted/60 border border-transparent"
      )}
    >
      <Clock className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
      <span className="text-sm text-foreground truncate flex-1">{query}</span>
      <RemoveButton onRemove={onRemove} />
    </button>
  );
}

function RecentItemList({ recent, onSelect, onRemove, activeIndex, onHover }: Omit<RecentSearchesProps, "onClearAll">) {
  return (
    <>
      {recent.map((q, i) => (
        <RecentItemButton key={q} query={q} isActive={activeIndex === i} onSelect={() => onSelect(q)} onHover={() => onHover(i)} onRemove={() => onRemove(q)} />
      ))}
    </>
  );
}

export function RecentSearches({ recent, onSelect, onClearAll, onRemove, activeIndex, onHover }: RecentSearchesProps) {
  if (recent.length === 0) {
    return null;
  }

  return (
    <div>
      <RecentSearchHeader onClearAll={onClearAll} />
      <RecentItemList recent={recent} onSelect={onSelect} onRemove={onRemove} activeIndex={activeIndex} onHover={onHover} />
    </div>
  );
}
