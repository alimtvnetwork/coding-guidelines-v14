import type { SpecNode } from "@/types/spec";
import { fuzzyMatch, fuzzyMatchContent } from "./fuzzyMatch";

export interface SearchResult {
  file: SpecNode;
  nameMatch: boolean;
  snippets: string[];
  snippetHighlights: number[][];
  score: number;
}

const MAX_RESULTS = 25;

function mapFileToResult(file: SpecNode, query: string): SearchResult | null {
  const nameResult = fuzzyMatch(file.name, query);
  const nameMatch = nameResult.score > 0;

  const { snippets, snippetHighlights } = file.content
    ? fuzzyMatchContent(file.content, query)
    : { snippets: [], snippetHighlights: [] };

  const contentScore = snippets.length > 0 ? 30 : 0;
  const totalScore = nameResult.score + contentScore;

  if (totalScore === 0) return null;

  return { file, nameMatch, snippets, snippetHighlights, score: totalScore };
}

function compareByScore(a: SearchResult, b: SearchResult): number {
  return b.score - a.score;
}

export function searchFiles(allFiles: SpecNode[], query: string): SearchResult[] {
  if (!query.trim()) return [];

  return allFiles
    .map((file) => mapFileToResult(file, query))
    .filter(Boolean)
    .sort((a, b) => compareByScore(a!, b!))
    .slice(0, MAX_RESULTS) as SearchResult[];
}
