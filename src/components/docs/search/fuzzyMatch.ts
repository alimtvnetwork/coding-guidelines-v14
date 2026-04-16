export interface FuzzyMatchResult {
  score: number;
  matchedIndices: number[];
}

const NO_MATCH: FuzzyMatchResult = { score: 0, matchedIndices: [] };

const SCORE_EXACT = 100;
const SCORE_WORD_START = 15;
const SCORE_CONSECUTIVE = 10;
const SCORE_BASE_CHAR = 5;
const PENALTY_GAP = -2;

function isWordBoundary(text: string, index: number): boolean {
  if (index === 0) return true;
  const prev = text[index - 1];
  return prev === " " || prev === "-" || prev === "_" || prev === "/" || prev === ".";
}

export function fuzzyMatch(text: string, query: string): FuzzyMatchResult {
  if (!query) return NO_MATCH;

  const textLower = text.toLowerCase();
  const queryLower = query.toLowerCase();

  // Exact substring match — highest score
  const exactIdx = textLower.indexOf(queryLower);
  if (exactIdx !== -1) {
    const indices = Array.from({ length: query.length }, (_, i) => exactIdx + i);
    return { score: SCORE_EXACT + (isWordBoundary(text, exactIdx) ? SCORE_WORD_START : 0), matchedIndices: indices };
  }

  // Fuzzy character-by-character match
  const matchedIndices: number[] = [];
  let queryIdx = 0;
  let score = 0;
  let lastMatchIdx = -2;

  for (let i = 0; i < text.length && queryIdx < queryLower.length; i++) {
    if (textLower[i] !== queryLower[queryIdx]) continue;

    matchedIndices.push(i);
    score += SCORE_BASE_CHAR;

    if (isWordBoundary(text, i)) {
      score += SCORE_WORD_START;
    }

    if (i === lastMatchIdx + 1) {
      score += SCORE_CONSECUTIVE;
    } else if (lastMatchIdx >= 0) {
      score += PENALTY_GAP * Math.min(i - lastMatchIdx, 10);
    }

    lastMatchIdx = i;
    queryIdx++;
  }

  if (queryIdx < queryLower.length) return NO_MATCH;

  // Bonus for matching ratio
  score += Math.round((query.length / text.length) * 20);

  return { score, matchedIndices };
}

export function fuzzyMatchContent(content: string, query: string, contextChars: number = 60, maxSnippets: number = 3): { snippets: string[]; snippetHighlights: number[][] } {
  const contentLower = content.toLowerCase();
  const queryLower = query.toLowerCase();
  const snippets: string[] = [];
  const snippetHighlights: number[][] = [];

  // Try exact matches first
  let searchFrom = 0;
  while (snippets.length < maxSnippets) {
    const idx = contentLower.indexOf(queryLower, searchFrom);
    if (idx === -1) break;

    const start = Math.max(0, idx - contextChars);
    const end = Math.min(content.length, idx + query.length + contextChars);
    const raw = content.slice(start, end).replace(/\n/g, " ");
    const prefix = start > 0 ? "…" : "";
    const suffix = end < content.length ? "…" : "";
    snippets.push(`${prefix}${raw}${suffix}`);

    // Highlight indices relative to snippet text
    const highlightStart = idx - start + prefix.length;
    const highlights = Array.from({ length: query.length }, (_, i) => highlightStart + i);
    snippetHighlights.push(highlights);

    searchFrom = idx + query.length;
  }

  // If no exact matches, try fuzzy on first ~500 chars
  if (snippets.length === 0) {
    const preview = content.slice(0, 500);
    const result = fuzzyMatch(preview, query);
    if (result.score > 0 && result.matchedIndices.length > 0) {
      const firstMatch = result.matchedIndices[0];
      const lastMatch = result.matchedIndices[result.matchedIndices.length - 1];
      const start = Math.max(0, firstMatch - contextChars);
      const end = Math.min(preview.length, lastMatch + contextChars);
      const raw = preview.slice(start, end).replace(/\n/g, " ");
      const prefix = start > 0 ? "…" : "";
      const suffix = end < preview.length ? "…" : "";
      snippets.push(`${prefix}${raw}${suffix}`);

      const highlights = result.matchedIndices
        .filter(i => i >= start && i < end)
        .map(i => i - start + prefix.length);
      snippetHighlights.push(highlights);
    }
  }

  return { snippets, snippetHighlights };
}
