import { useMemo, useCallback, useEffect, useRef } from "react";
import { List } from "lucide-react";

interface TocItem {
  level: number;
  text: string;
  id: string;
}

function parseHeadingLine(line: string): TocItem | null {
  const match = line.match(/^(#{1,4})\s+(.+)$/);

  if (!match) return null;

  const level = match[1].length;
  const text = match[2].replace(/\*\*(.+?)\*\*/g, "$1").replace(/`(.+?)`/g, "$1");
  const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  return { level, text, id };
}

function extractHeadings(markdown: string): TocItem[] {
  const state = { isInCodeBlock: false };

  return markdown.split("\n").reduce<TocItem[]>((headings, line) => {

    if (line.startsWith("```")) { state.isInCodeBlock = !state.isInCodeBlock; return headings; }

    if (state.isInCodeBlock) return headings;

    const heading = parseHeadingLine(line);

    if (heading) headings.push(heading);

    return headings;
  }, []);
}

function getHeadingIndentClass(level: number): string {
  const indentMap: Record<number, string> = {
    1: "pl-3 font-medium",
    2: "pl-4",
    3: "pl-5 text-[0.7rem]",
    4: "pl-6 text-[0.65rem]",
  };

  return indentMap[level] || "pl-4";
}

interface TableOfContentsProps {
  content: string;
  activeId?: string;
  onScrollTo: (id: string) => void;
}

function TocButton({ heading, isActive, onClick, buttonRef }: { heading: TocItem; isActive: boolean; onClick: () => void; buttonRef?: React.Ref<HTMLButtonElement> }) {
  const indentClass = getHeadingIndentClass(heading.level);
  const activeClass = isActive
    ? "text-primary border-l-2 border-primary -ml-px"
    : "text-muted-foreground hover:border-l-2 hover:border-muted-foreground/40 hover:-ml-px";

  return (
    <button
      ref={buttonRef}
      onClick={onClick}
      className={`block w-full text-left text-xs leading-snug py-1 transition-all duration-200 hover:text-foreground ${indentClass} ${activeClass}`}
      title={heading.text}
    >
      <span className="line-clamp-2">{heading.text}</span>
    </button>
  );
}

function TocHeader() {
  return (
    <div className="flex items-center gap-1.5 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
      <List className="h-3 w-3" />
      <span>On this page</span>
    </div>
  );
}

function TocNavList({ headings, activeId, onClick }: { headings: TocItem[]; activeId?: string; onClick: (id: string) => void }) {
  const activeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!activeRef.current) return;

    activeRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [activeId]);

  return (
    <nav className="space-y-0.5 border-l border-border/50">
      {headings.map((h, i) => (
        <TocButton key={`${h.id}-${i}`} heading={h} isActive={activeId === h.id} buttonRef={activeId === h.id ? activeRef : undefined} onClick={() => onClick(h.id)} />
      ))}
    </nav>
  );
}

export function TableOfContents({ content, activeId, onScrollTo }: TableOfContentsProps) {
  const headings = useMemo(() => extractHeadings(content), [content]);
  const handleClick = useCallback((id: string) => onScrollTo(id), [onScrollTo]);

  if (headings.length === 0) return null;

  return (
    <div className="w-52 shrink-0 hidden xl:block">
      <div className="sticky top-6 max-h-[calc(100vh-8rem)] overflow-y-auto">
        <TocHeader />
        <TocNavList headings={headings} activeId={activeId} onClick={handleClick} />
      </div>
    </div>
  );
}
