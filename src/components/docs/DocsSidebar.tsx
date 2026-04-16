import { useState, useCallback } from "react";
import { Search, Library, FileText, Download, MoreVertical, ChevronsDownUp, ChevronsUpDown } from "lucide-react";

import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SpecTreeNav } from "@/components/SpecTreeNav";
import { useSpecSearch } from "@/hooks/useSpecData";
import { downloadFolderAsZip } from "@/lib/downloadUtils";
import { SpecNodeType, type SpecNode } from "@/types/spec";
import { cn } from "@/lib/utils";
import {
  Sidebar, SidebarContent, SidebarHeader,
  SidebarGroup, SidebarGroupLabel, SidebarGroupContent,
  SidebarMenu, SidebarMenuItem, SidebarMenuButton,
} from "@/components/ui/sidebar";

function SearchResultItem({ node, onSelect }: { node: SpecNode; onSelect: (n: SpecNode) => void }) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton onClick={() => onSelect(node)} className="text-sm">
        <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        <div className="truncate">
          <div className="truncate font-medium">{node.name}</div>
          <div className="truncate text-xs text-muted-foreground">{node.path}</div>
        </div>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

function SidebarSearchResults({ results, onSelect }: { results: SpecNode[]; onSelect: (n: SpecNode) => void }) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Results ({results.length})</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {results.map((f) => <SearchResultItem key={f.path} node={f} onSelect={onSelect} />)}
          {results.length === 0 && (
            <p className="px-4 py-3 text-sm text-muted-foreground">No results found</p>
          )}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

interface DocsSidebarProps {
  tree: SpecNode[];
  activePath: string | null;
  onSelect: (n: SpecNode) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  allFiles: SpecNode[];
}

function SidebarSearchInput({ searchQuery, setSearchQuery }: { searchQuery: string; setSearchQuery: (q: string) => void }) {
  return (
    <div className="relative group-data-[collapsible=icon]:hidden">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input placeholder="Search docs…" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-8 pr-14 h-9 text-sm" />
      <kbd className="absolute right-2 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-border bg-muted text-[10px] font-mono text-muted-foreground">
        ⌘K
      </kbd>
    </div>
  );
}

function useDownloadAll(tree: SpecNode[]) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = useCallback(() => {
    const rootNode: SpecNode = {
      name: "spec",
      path: "spec",
      type: SpecNodeType.Folder,
      children: tree,
    };
    setIsDownloading(true);
    downloadFolderAsZip(rootNode).finally(() => setIsDownloading(false));
  }, [tree]);

  return { isDownloading, handleDownload };
}

function DownloadAllButton({ tree }: { tree: SpecNode[] }) {
  const { isDownloading, handleDownload } = useDownloadAll(tree);

  return (
    <button
      onClick={handleDownload}
      className="p-1.5 rounded-md hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"
      title="Download all specs as ZIP"
    >
      <Download className={cn("h-4 w-4", isDownloading && "animate-pulse")} />
    </button>
  );
}

const MENU_ITEM_CLASS = "flex items-center gap-2 w-full rounded-sm px-3 py-2 text-sm text-popover-foreground hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer";

function FolderActionsDropdown({ onExpandAll, onCollapseAll, onClose }: { onExpandAll: () => void; onCollapseAll: () => void; onClose: () => void }) {
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute right-0 top-full mt-1 z-50 min-w-[180px] rounded-md border border-border bg-popover p-1 shadow-md animate-in fade-in-0 zoom-in-95 duration-150">
        <button className={MENU_ITEM_CLASS} onClick={() => { onExpandAll(); onClose(); }}>
          <ChevronsUpDown className="h-4 w-4" />
          Expand all folders
        </button>
        <button className={MENU_ITEM_CLASS} onClick={() => { onCollapseAll(); onClose(); }}>
          <ChevronsDownUp className="h-4 w-4" />
          Collapse all folders
        </button>
      </div>
    </>
  );
}

function FolderActionsMenu({ onExpandAll, onCollapseAll }: { onExpandAll: () => void; onCollapseAll: () => void }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className="p-1.5 rounded-md hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"
        title="Folder options"
      >
        <MoreVertical className="h-4 w-4" />
      </button>
      {isOpen && <FolderActionsDropdown onExpandAll={onExpandAll} onCollapseAll={onCollapseAll} onClose={() => setIsOpen(false)} />}
    </div>
  );
}

function SidebarBranding({ tree, onExpandAll, onCollapseAll }: { tree: SpecNode[]; onExpandAll: () => void; onCollapseAll: () => void }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <Library className="h-5 w-5 text-primary" />
      <span className="font-bold text-sm font-heading group-data-[collapsible=icon]:hidden flex-1">Spec Docs</span>
      <FolderActionsMenu onExpandAll={onExpandAll} onCollapseAll={onCollapseAll} />
      <DownloadAllButton tree={tree} />
    </div>
  );
}

function SidebarBody({ searchQuery, searchResults, tree, activePath, onSelect, folderSignal }: { searchQuery: string; searchResults: SpecNode[]; tree: SpecNode[]; activePath: string | null; onSelect: (n: SpecNode) => void; folderSignal: number }) {
  if (searchQuery) {
    return <SidebarSearchResults results={searchResults} onSelect={onSelect} />;
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Specifications</SidebarGroupLabel>
      <SidebarGroupContent>
        <SpecTreeNav nodes={tree} activePath={activePath} onSelect={onSelect} folderSignal={folderSignal} />
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

function DocsSidebarContent({ tree, activePath, onSelect, searchQuery, searchResults, folderSignal, setSearchQuery, handleExpandAll, handleCollapseAll }: DocsSidebarProps & { searchResults: SpecNode[]; folderSignal: number; handleExpandAll: () => void; handleCollapseAll: () => void }) {
  return (
    <>
      <SidebarHeader className="p-4 border-b border-border">
        <SidebarBranding tree={tree} onExpandAll={handleExpandAll} onCollapseAll={handleCollapseAll} />
        <SidebarSearchInput searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      </SidebarHeader>
      <SidebarContent>
        <ScrollArea className="h-[calc(100vh-120px)]">
          <SidebarBody searchQuery={searchQuery} searchResults={searchResults} tree={tree} activePath={activePath} onSelect={onSelect} folderSignal={folderSignal} />
        </ScrollArea>
      </SidebarContent>
    </>
  );
}

export function DocsSidebar({ tree, activePath, onSelect, searchQuery, setSearchQuery, allFiles }: DocsSidebarProps) {
  const searchResults = useSpecSearch(allFiles, searchQuery);
  const [folderSignal, setFolderSignal] = useState(0);

  const handleExpandAll = useCallback(() => setFolderSignal(prev => Math.abs(prev) + 1), []);
  const handleCollapseAll = useCallback(() => setFolderSignal(prev => -(Math.abs(prev) + 1)), []);

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <DocsSidebarContent tree={tree} activePath={activePath} onSelect={onSelect} searchQuery={searchQuery} setSearchQuery={setSearchQuery} allFiles={allFiles} searchResults={searchResults} folderSignal={folderSignal} handleExpandAll={handleExpandAll} handleCollapseAll={handleCollapseAll} />
    </Sidebar>
  );
}
