import { useState, useCallback, useEffect } from "react";
import { ChevronRight, FileText, FolderOpen, Folder, Download } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { SpecNode } from "@/types/spec";
import { downloadFolderAsZip } from "@/lib/downloadUtils";
import {
  SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarMenuSub,
} from "@/components/ui/sidebar";
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface SpecTreeNavProps {
  nodes: SpecNode[];
  activePath: string | null;
  onSelect: (node: SpecNode) => void;
  depth?: number;
  folderSignal?: number;
}

export function SpecTreeNav({ nodes, activePath, onSelect, depth = 0, folderSignal = 0 }: SpecTreeNavProps) {
  return (
    <SidebarMenu>
      {nodes.map((node) => (
        <SpecTreeItem key={node.path} node={node} activePath={activePath} onSelect={onSelect} depth={depth} folderSignal={folderSignal} />
      ))}
    </SidebarMenu>
  );
}

interface SpecTreeItemProps {
  node: SpecNode;
  activePath: string | null;
  onSelect: (node: SpecNode) => void;
  depth: number;
  folderSignal: number;
}

function FolderIcon({ isOpen }: { isOpen: boolean }) {
  if (isOpen) {
    return <FolderOpen className="h-4 w-4 shrink-0 text-primary" />;
  }

  return <Folder className="h-4 w-4 shrink-0 text-muted-foreground" />;
}

function useDownloadFolder(node: SpecNode) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsDownloading(true);
    downloadFolderAsZip(node)
      .then(() => toast.success(`Downloaded "${node.name}" as ZIP`))
      .catch(() => toast.error(`Failed to download "${node.name}"`))
      .finally(() => setIsDownloading(false));
  }, [node]);

  return { isDownloading, handleDownload };
}

function FolderChildren({ node, activePath, onSelect, depth, folderSignal }: SpecTreeItemProps) {
  return (
    <CollapsibleContent>
      <SidebarMenuSub>
        <SpecTreeNav nodes={node.children!} activePath={activePath} onSelect={onSelect} depth={depth + 1} folderSignal={folderSignal} />
      </SidebarMenuSub>
    </CollapsibleContent>
  );
}

function useFolderSignal(folderSignal: number, setOpen: (v: boolean) => void): void {
  useEffect(() => {
    if (folderSignal === 0) {
      return;
    }

    setOpen(folderSignal > 0);
  }, [folderSignal]);
}

function FolderDownloadButton({ node }: { node: SpecNode }) {
  const { isDownloading, handleDownload } = useDownloadFolder(node);

  return (
    <button
      onClick={handleDownload}
      className="p-1 rounded-sm opacity-0 group-hover/folder:opacity-70 hover:!opacity-100 hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-all duration-200 shrink-0 mr-1"
      title={`Download ${node.name} as ZIP`}
    >
      <Download className={cn("h-3 w-3", isDownloading && "animate-pulse")} />
    </button>
  );
}

function FolderTrigger({ node, isOpen }: { node: SpecNode; isOpen: boolean }) {
  return (
    <CollapsibleTrigger asChild>
      <SidebarMenuButton className="flex-1 justify-start gap-2 text-sm font-medium">
        <ChevronRight className={cn("h-3.5 w-3.5 shrink-0 transition-transform duration-200", isOpen && "rotate-90")} />
        <FolderIcon isOpen={isOpen} />
        <span className="truncate">{node.name}</span>
      </SidebarMenuButton>
    </CollapsibleTrigger>
  );
}

function FolderItem({ node, activePath, onSelect, depth, folderSignal }: SpecTreeItemProps) {
  const isActiveInSubtree = activePath !== null && activePath.startsWith(node.path + "/");
  const [open, setOpen] = useState(isActiveInSubtree || depth === 0);
  useFolderSignal(folderSignal, setOpen);

  return (
    <SidebarMenuItem>
      <Collapsible open={open} onOpenChange={setOpen}>
        <div className="group/folder flex items-center w-full">
          <FolderTrigger node={node} isOpen={open} />
          <FolderDownloadButton node={node} />
        </div>
        <FolderChildren node={node} activePath={activePath} onSelect={onSelect} depth={depth} folderSignal={folderSignal} />
      </Collapsible>
    </SidebarMenuItem>
  );
}

function FileItem({ node, activePath, onSelect }: Omit<SpecTreeItemProps, "depth" | "folderSignal">) {
  const isActive = activePath === node.path;

  return (
    <SidebarMenuItem>
      <SidebarMenuButton onClick={() => onSelect(node)} isActive={isActive} className="w-full justify-start gap-2 text-sm">
        <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        <span className="truncate">{node.name}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

const NODE_TYPE_FOLDER = "folder";

function SpecTreeItem(props: SpecTreeItemProps) {
  const { node } = props;
  const hasChildren = node.type === NODE_TYPE_FOLDER && node.children && node.children.length > 0;

  if (hasChildren) {
    return <FolderItem {...props} />;
  }

  return <FileItem node={node} activePath={props.activePath} onSelect={props.onSelect} />;
}
