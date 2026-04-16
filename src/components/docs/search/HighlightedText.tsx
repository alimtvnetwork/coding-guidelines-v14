import { fuzzyMatch } from "./fuzzyMatch";

interface HighlightedTextProps {
  text: string;
  query: string;
  highlightIndices?: number[];
}

function buildHighlightRanges(indices: number[]): [number, number][] {
  if (indices.length === 0) return [];
  const sorted = [...indices].sort((a, b) => a - b);
  const ranges: [number, number][] = [];
  let start = sorted[0];
  let end = sorted[0];

  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === end + 1) {
      end = sorted[i];
    } else {
      ranges.push([start, end]);
      start = sorted[i];
      end = sorted[i];
    }
  }
  ranges.push([start, end]);
  return ranges;
}

export function HighlightedText({ text, query, highlightIndices }: HighlightedTextProps) {
  if (!query.trim()) return <>{text}</>;

  const indices = highlightIndices ?? fuzzyMatch(text, query).matchedIndices;
  if (indices.length === 0) return <>{text}</>;

  const ranges = buildHighlightRanges(indices);
  const parts: React.ReactNode[] = [];
  let lastEnd = 0;

  for (const [start, end] of ranges) {
    if (start > lastEnd) {
      parts.push(<span key={`t-${lastEnd}`}>{text.slice(lastEnd, start)}</span>);
    }
    parts.push(
      <mark key={`h-${start}`} className="bg-primary/25 text-foreground rounded-sm px-0.5">
        {text.slice(start, end + 1)}
      </mark>
    );
    lastEnd = end + 1;
  }

  if (lastEnd < text.length) {
    parts.push(<span key={`t-${lastEnd}`}>{text.slice(lastEnd)}</span>);
  }

  return <>{parts}</>;
}
