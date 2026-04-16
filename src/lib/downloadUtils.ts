import JSZip from "jszip";
import { SpecNodeType, type SpecNode } from "@/types/spec";

interface CollectedFile {
  path: string;
  content: string;
}

function buildRelativePath(nodePath: string, basePath: string): string {
  if (nodePath.startsWith(basePath)) {
    return nodePath.slice(basePath.length + 1);
  }

  return nodePath;
}

function collectFileEntry(node: SpecNode, basePath: string): CollectedFile[] {
  if (node.type !== SpecNodeType.File || !node.content) return [];

  return [{ path: buildRelativePath(node.path, basePath), content: node.content }];
}

/** Download a single markdown file */
export function downloadFile(node: SpecNode) {
  const content = node.content || "";
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = node.path.split("/").pop() || "document.md";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Recursively collect all files from a spec node tree */
function collectFiles(node: SpecNode, basePath: string): CollectedFile[] {
  const files = collectFileEntry(node, basePath);

  if (!node.children) return files;

  for (const child of node.children) {
    files.push(...collectFiles(child, basePath));
  }

  return files;
}

/** Download a folder as a zip file */
export async function downloadFolderAsZip(node: SpecNode) {
  const zip = new JSZip();
  const files = collectFiles(node, node.path);

  for (const file of files) {
    zip.file(file.path, file.content);
  }

  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const folderName = node.path.split("/").pop() || "folder";
  a.download = `${folderName}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function searchNode(node: SpecNode, parentPath: string): SpecNode | null {
  if (node.type === SpecNodeType.Folder && node.path === parentPath) return node;

  if (!node.children) return null;

  const results = node.children.map(child => searchNode(child, parentPath));
  const match = results.find(r => r !== null);

  return match ?? null;
}

/** Find the parent folder node for a given file path */
export function findParentFolder(tree: SpecNode[], filePath: string): SpecNode | null {
  const parentPath = filePath.split("/").slice(0, -1).join("/");

  for (const node of tree) {
    const found = searchNode(node, parentPath);

    if (found) return found;
  }

  return null;
}
