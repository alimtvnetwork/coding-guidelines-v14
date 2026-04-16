import { useState, useRef, useEffect, useCallback } from "react";
import { Eye, Code2, Pencil, Columns2, Copy, Check, Maximize2, Minimize2, Keyboard, Sun, Moon, Download, FileDown, FolderDown, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SpecNode } from "@/types/spec";
import { ViewModeType, ThemeType, type ViewMode } from "@/constants/enums";
import { downloadFile, downloadFolderAsZip, findParentFolder } from "@/lib/downloadUtils";

interface ViewModeToggleProps {
  viewMode: ViewMode;
  activeFile: SpecNode;
  setViewMode: (m: ViewMode) => void;
  setEditContent: (c: string) => void;
}

function useEditSwitch(viewMode: ViewMode, activeFile: SpecNode, setEditContent: (c: string) => void) {
  const isAlreadyEditing = viewMode === ViewModeType.Edit || viewMode === ViewModeType.Split;

  return (_target: ViewMode) => {
    if (!isAlreadyEditing) setEditContent(activeFile.content || "");
  };
}

interface ViewModeButtonProps {
  label: string;
  icon: React.ElementType;
  isActive: boolean;
  onClick: () => void;
}

function ViewModeButton({ label, icon: Icon, isActive, onClick }: ViewModeButtonProps) {
  return (
    <Button variant={isActive ? "secondary" : "ghost"} size="sm" onClick={onClick} className="h-6 px-2 text-xs gap-1 rounded-sm">
      <Icon className="h-3 w-3" /> {label}
    </Button>
  );
}

export function ViewModeToggle({ viewMode, activeFile, setViewMode, setEditContent }: ViewModeToggleProps) {
  const prepareEdit = useEditSwitch(viewMode, activeFile, setEditContent);

  const handleEdit = () => { prepareEdit(ViewModeType.Edit); setViewMode(ViewModeType.Edit); };
  const handleSplit = () => { prepareEdit(ViewModeType.Split); setViewMode(ViewModeType.Split); };

  return (
    <div className="flex items-center gap-0.5 mr-1 border border-border rounded-md p-0.5 bg-muted/30">
      <ViewModeButton label="Preview" icon={Eye} isActive={viewMode === ViewModeType.Preview} onClick={() => setViewMode(ViewModeType.Preview)} />
      <ViewModeButton label="Source" icon={Code2} isActive={viewMode === ViewModeType.Source} onClick={() => setViewMode(ViewModeType.Source)} />
      <ViewModeButton label="Edit" icon={Pencil} isActive={viewMode === ViewModeType.Edit} onClick={handleEdit} />
      <ViewModeButton label="Split" icon={Columns2} isActive={viewMode === ViewModeType.Split} onClick={handleSplit} />
    </div>
  );
}

interface ToolbarButtonsProps {
  activeFile: SpecNode | null;
  copied: boolean;
  isFullscreen: boolean;
  theme: string;
  tree: SpecNode[];
  allCollapsed: boolean | null;
  handleCopyMarkdown: () => void;
  setIsFullscreen: React.Dispatch<React.SetStateAction<boolean>>;
  toggleTheme: () => void;
  setShowShortcuts: React.Dispatch<React.SetStateAction<boolean>>;
  toggleAllSections: () => void;
}

const TOOLBAR_BTN_CLASS = "h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded-md transition-all duration-200";
const DROPDOWN_ITEM_CLASS = "flex items-center gap-2 w-full rounded-sm px-3 py-2 text-sm text-popover-foreground hover:bg-accent hover:text-accent-foreground transition-colors";

function CopyButton({ copied, onClick }: { copied: boolean; onClick: () => void }) {
  return (
    <Button variant="ghost" size="icon" onClick={onClick} className={TOOLBAR_BTN_CLASS} title="Copy markdown">
      {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
    </Button>
  );
}

function createOutsideHandler(ref: React.RefObject<HTMLDivElement>, onClose: () => void) {
  return (e: MouseEvent) => {
    const isInside = !ref.current || ref.current.contains(e.target as Node);

    if (isInside) return;

    onClose();
  };
}

function useClickOutside(ref: React.RefObject<HTMLDivElement>, isOpen: boolean, onClose: () => void) {
  useEffect(() => {
    if (!isOpen) return;

    const handler = createOutsideHandler(ref, onClose);
    document.addEventListener("mousedown", handler);

    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen, ref, onClose]);
}

function DownloadFileItem({ activeFile, onClose }: { activeFile: SpecNode; onClose: () => void }) {
  const handleClick = useCallback(() => {
    downloadFile(activeFile);
    onClose();
  }, [activeFile, onClose]);

  return (
    <button onClick={handleClick} className={DROPDOWN_ITEM_CLASS}>
      <FileDown className="h-4 w-4" />
      <div className="text-left">
        <div className="font-medium">Download file</div>
        <div className="text-xs text-muted-foreground truncate max-w-[160px]">{activeFile.path.split("/").pop()}</div>
      </div>
    </button>
  );
}

function DownloadFolderItem({ parentFolder, tree, activeFile, onClose }: { parentFolder: SpecNode; tree: SpecNode[]; activeFile: SpecNode; onClose: () => void }) {
  const handleClick = useCallback(() => {
    const parent = findParentFolder(tree, activeFile.path);

    if (parent) downloadFolderAsZip(parent);

    onClose();
  }, [activeFile, tree, onClose]);

  return (
    <button onClick={handleClick} className={DROPDOWN_ITEM_CLASS}>
      <FolderDown className="h-4 w-4" />
      <div className="text-left">
        <div className="font-medium">Download folder as ZIP</div>
        <div className="text-xs text-muted-foreground truncate max-w-[160px]">{parentFolder.name}/</div>
      </div>
    </button>
  );
}

function DownloadMenu({ activeFile, tree, onClose }: { activeFile: SpecNode; tree: SpecNode[]; onClose: () => void }) {
  const parentFolder = findParentFolder(tree, activeFile.path);

  return (
    <div className="absolute right-0 top-full mt-1 z-50 min-w-[200px] rounded-md border border-border bg-popover p-1 shadow-md animate-in fade-in-0 zoom-in-95 duration-150">
      <DownloadFileItem activeFile={activeFile} onClose={onClose} />
      {parentFolder && <DownloadFolderItem parentFolder={parentFolder} tree={tree} activeFile={activeFile} onClose={onClose} />}
    </div>
  );
}

function DownloadDropdown({ activeFile, tree }: { activeFile: SpecNode; tree: SpecNode[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setIsOpen(false), []);

  useClickOutside(ref, isOpen, close);

  return (
    <div className="relative" ref={ref}>
      <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)} className={TOOLBAR_BTN_CLASS} title="Download">
        <Download className="h-3.5 w-3.5" />
      </Button>
      {isOpen && <DownloadMenu activeFile={activeFile} tree={tree} onClose={close} />}
    </div>
  );
}

function FullscreenButton({ isFullscreen, onClick }: { isFullscreen: boolean; onClick: () => void }) {
  return (
    <Button variant="ghost" size="icon" onClick={onClick} className={TOOLBAR_BTN_CLASS} title={isFullscreen ? "Exit fullscreen (F)" : "Fullscreen (F)"}>
      {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
    </Button>
  );
}

function ThemeButton({ theme, onClick }: { theme: string; onClick: () => void }) {
  const isDark = theme === ThemeType.Dark;

  return (
    <Button variant="ghost" size="icon" onClick={onClick} className={TOOLBAR_BTN_CLASS} title={isDark ? "Light mode" : "Dark mode"}>
      {isDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
    </Button>
  );
}

function ActiveFileButtons({ activeFile, copied, tree, allCollapsed, handleCopyMarkdown, toggleAllSections }: Pick<ToolbarButtonsProps, "activeFile" | "copied" | "tree" | "allCollapsed" | "handleCopyMarkdown" | "toggleAllSections">) {
  if (!activeFile) {
    return null;
  }

  return (
    <>
      <CopyButton copied={copied} onClick={handleCopyMarkdown} />
      <DownloadDropdown activeFile={activeFile} tree={tree} />
      <Button variant="ghost" size="icon" onClick={toggleAllSections} className={TOOLBAR_BTN_CLASS} title={allCollapsed === true ? "Expand all sections" : "Collapse all sections"}>
        <ChevronsUpDown className="h-3.5 w-3.5" />
      </Button>
    </>
  );
}

export function ToolbarButtons({ activeFile, copied, isFullscreen, theme, tree, allCollapsed, handleCopyMarkdown, setIsFullscreen, toggleTheme, setShowShortcuts, toggleAllSections }: ToolbarButtonsProps) {
  return (
    <>
      <ActiveFileButtons activeFile={activeFile} copied={copied} tree={tree} allCollapsed={allCollapsed} handleCopyMarkdown={handleCopyMarkdown} toggleAllSections={toggleAllSections} />
      <FullscreenButton isFullscreen={isFullscreen} onClick={() => setIsFullscreen(prev => !prev)} />
      <ThemeButton theme={theme} onClick={toggleTheme} />
      <Button variant="ghost" size="icon" onClick={() => setShowShortcuts(prev => !prev)} className={TOOLBAR_BTN_CLASS} title="Keyboard shortcuts (?)">
        <Keyboard className="h-3.5 w-3.5" />
      </Button>
    </>
  );
}
