export enum SpecNodeType {
  File = "file",
  Folder = "folder",
}

export interface SpecNode {
  name: string;
  path: string;
  type: SpecNodeType;
  content?: string;
  children?: SpecNode[];
}

export interface SpecTreeData {
  specTree: SpecNode[];
}
