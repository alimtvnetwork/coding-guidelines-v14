import type { SpecNode } from "@/types/spec";

export interface SearchResult {
  file: SpecNode;
  nameMatch: boolean;
  snippets: string[];
}

const SNIPPET_CONTEXT_CHARS = 60;
const DEFAULT_MAX_SNIPPETS = 3;
const MAX_RESULTS = 25;

function buildSnippet(content: string, idx: number, queryLength: number): string {
  const snippetStart = Math.max(0, idx - SNIPPET_CONTEXT_CHARS);
  const snippetEnd = Math.min(content.length, idx + queryLength + SNIPPET_CONTEXT_CHARS);
  const raw = content.slice(snippetStart, snippetEnd).replace(/\n/g, " ");
  const prefix = snippetStart > 0 ? "…" : "";
  const suffix = snippetEnd < content.length ? "…" : "";

  return `${prefix}${raw}${suffix}`;
}

function getSnippets(content: string, query: string, maxSnippets = DEFAULT_MAX_SNIPPETS): string[] {
  const lower = content.toLowerCase();
  const q = query.toLowerCase();
  const snippets: string[] = [];
  const firstPos = lower.indexOf(q, 0);
  const positions = [firstPos];

  while (positions.length <= maxSnippets) {
    const last = positions[positions.length - 1];

    if (last === -1) {
      break;
    }

    positions.push(lower.indexOf(q, last + query.length));
  }

  for (const pos of positions) {
    if (pos === -1 || snippets.length >= maxSnippets) {
      break;
    }

    snippets.push(buildSnippet(content, pos, query.length));
  }

  return snippets;
}

function mapFileToResult(file: SpecNode, query: string): SearchResult | null {
  const q = query.toLowerCase();
  const nameMatch = file.name.toLowerCase().includes(q);
  const contentMatch = file.content?.toLowerCase().includes(q) ?? false;
  const hasMatch = nameMatch || contentMatch;

  if (!hasMatch) {
    return null;
  }

  const snippets = file.content ? getSnippets(file.content, query) : [];

  return { file, nameMatch, snippets };
}

function compareByNameMatch(a: SearchResult, b: SearchResult): number {
  if (a.nameMatch && !b.nameMatch) {
    return -1;
  }

  if (!a.nameMatch && b.nameMatch) {
    return 1;
  }

  return 0;
}

export function searchFiles(allFiles: SpecNode[], query: string): SearchResult[] {
  if (!query.trim()) {
    return [];
  }

  return allFiles
    .map((file) => mapFileToResult(file, query))
    .filter(Boolean)
    .sort((a, b) => compareByNameMatch(a!, b!))
    .slice(0, MAX_RESULTS) as SearchResult[];
}
