import { useState, useMemo } from "react";
import type { SpecNode } from "@/types/spec";
import specData from "@/data/specTree.json";
import { SpecEntryType } from "@/constants/enums";

const flattenFiles = (nodes: SpecNode[]): SpecNode[] => {
  const result: SpecNode[] = [];
  for (const node of nodes) {

    if (node.type === SpecEntryType.File) result.push(node);

    if (node.children) result.push(...flattenFiles(node.children));
  }

  return result;
};

export function useSpecData() {
  const tree = specData.specTree as SpecNode[];
  const allFiles = useMemo(() => flattenFiles(tree), [tree]);

  return { tree, allFiles };
}

export function useSpecSearch(allFiles: SpecNode[], query: string) {
  return useMemo(() => {

    if (!query.trim()) return [];
    const q = query.toLowerCase();

    return allFiles
      .filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          (f.content && f.content.toLowerCase().includes(q))
      )
      .slice(0, 20);
  }, [allFiles, query]);
}
