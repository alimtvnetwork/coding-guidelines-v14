/**
 * Sub-components extracted from DocsViewer for file-size compliance.
 */
import React, { useEffect } from "react";
import { HtmlTag } from "@/constants/htmlTags";
import { KeyboardKeyType } from "@/constants/enums";
import { MonacoMarkdownEditor } from "@/components/MonacoMarkdownEditor";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { TableOfContents } from "@/components/TableOfContents";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ViewModeToggle, ToolbarButtons } from "@/components/docs/DocsToolbar";
import { WelcomeScreen } from "@/components/docs/WelcomeScreen";
import { DocsSidebar } from "@/components/docs/DocsSidebar";
import { ShortcutsOverlay } from "@/components/docs/ShortcutsOverlay";
import { SourceView } from "@/components/docs/SourceView";
import { ViewModeType, type ViewMode } from "@/constants/enums";
import type { SpecNode } from "@/types/spec";
import type { ContentPanelDeps, ContentPanelInput } from "./DocsViewerHelpers";
import { useViewState, useSplitState, useContentPanelDeps } from "./DocsViewerHelpers";
import { useCollapsibleState } from "@/hooks/useCollapsibleSections";

export function BreadcrumbNav({ breadcrumb }: { breadcrumb: string[] }) {
  if (breadcrumb.length === 0) return <div className="flex-1" />;

  return (
    <nav className="flex items-center gap-1 text-sm text-muted-foreground overflow-hidden flex-1">
      {breadcrumb.map((seg, i) => (
        <span key={i} className="flex items-center gap-1 truncate">
          {i > 0 && <span className="text-border">/</span>}
          <span className={i === breadcrumb.length - 1 ? "text-foreground font-medium" : ""}>{seg}</span>
        </span>
      ))}
    </nav>
  );
}

export function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="h-1 w-full bg-muted/30 shrink-0 overflow-hidden">
      <div className="h-full transition-all duration-150 ease-out rounded-r-full" style={{ width: `${progress * 100}%`, background: `linear-gradient(90deg, hsl(var(--primary)), hsl(var(--accent)))` }} />
    </div>
  );
}

function EditView({ content, onChange }: { content: string; onChange: (v: string) => void }) {
  return (
    <div className="h-full p-4">
      <MonacoMarkdownEditor content={content} onChange={onChange} />
    </div>
  );
}

interface SplitViewProps {
  editContent: string;
  setEditContent: (v: string) => void;
  splitRatio: number;
  isFullscreen: boolean;
  splitContainerRef: React.RefObject<HTMLDivElement>;
  onDividerMouseDown: (e: React.MouseEvent) => void;
  allCollapsed: boolean | null;
  filePath?: string;
}

function SplitView({ editContent, setEditContent, splitRatio, isFullscreen, splitContainerRef, onDividerMouseDown, allCollapsed, filePath }: SplitViewProps) {
  return (
    <div ref={splitContainerRef} className="h-full flex relative">
      <div className="h-full p-4 overflow-hidden" style={{ width: `${splitRatio}%` }}>
        <MonacoMarkdownEditor content={editContent} onChange={setEditContent} />
      </div>
      <div className="split-divider" onMouseDown={onDividerMouseDown} />
      <div className="h-full overflow-auto" style={{ width: `${100 - splitRatio}%` }}>
        <div className={`max-w-4xl mx-auto px-6 py-6 ${isFullscreen ? 'prose-fullscreen' : ''}`}>
          <MarkdownRenderer content={editContent} allCollapsed={allCollapsed} filePath={filePath} />
        </div>
      </div>
    </div>
  );
}

interface PreviewViewProps {
  activeFile: SpecNode;
  isFullscreen: boolean;
  onScrollTo: (id: string) => void;
  activeHeadingId?: string;
  allCollapsed: boolean | null;
}

function PreviewView({ activeFile, isFullscreen, onScrollTo, activeHeadingId, allCollapsed }: PreviewViewProps) {
  return (
    <div className={`flex gap-6 max-w-6xl mx-auto px-6 py-6 sm:px-8 lg:px-10 ${isFullscreen ? 'prose-fullscreen' : ''}`}>
      <div className="flex-1 min-w-0 max-w-4xl">
        <MarkdownRenderer content={activeFile.content || ""} allCollapsed={allCollapsed} filePath={activeFile.path} />
      </div>
      <TableOfContents content={activeFile.content || ""} activeId={activeHeadingId} onScrollTo={onScrollTo} />
    </div>
  );
}

interface DocsMainContentProps {
  activeFile: SpecNode | null;
  viewMode: ViewMode;
  editContent: string;
  setEditContent: (v: string) => void;
  splitRatio: number;
  isFullscreen: boolean;
  splitContainerRef: React.RefObject<HTMLDivElement>;
  handleDividerMouseDown: (e: React.MouseEvent) => void;
  handleScrollTo: (id: string) => void;
  activeHeadingId?: string;
  allFiles: SpecNode[];
  onSelect: (node: SpecNode) => void;
  allCollapsed: boolean | null;
}

function handleBrowse(allFiles: SpecNode[], onSelect: (node: SpecNode) => void) {
  const first = allFiles.find(f => f.path.endsWith("00-overview.md"));

  if (first) onSelect(first);
}

export function DocsMainContent(props: DocsMainContentProps) {
  const { activeFile, viewMode, editContent, setEditContent, allFiles, onSelect } = props;

  if (!activeFile) {
    return <WelcomeScreen fileCount={allFiles.length} onBrowse={() => handleBrowse(allFiles, onSelect)} />;
  }

  if (viewMode === ViewModeType.Source) return <SourceView content={activeFile.content || ""} />;

  if (viewMode === ViewModeType.Edit) return <EditView content={editContent} onChange={setEditContent} />;

  if (viewMode === ViewModeType.Split) {
    return <SplitView editContent={editContent} setEditContent={setEditContent} splitRatio={props.splitRatio} isFullscreen={props.isFullscreen} splitContainerRef={props.splitContainerRef} onDividerMouseDown={props.handleDividerMouseDown} allCollapsed={props.allCollapsed} filePath={activeFile.path} />;
  }

  return <PreviewView activeFile={activeFile} isFullscreen={props.isFullscreen} onScrollTo={props.handleScrollTo} activeHeadingId={props.activeHeadingId} allCollapsed={props.allCollapsed} />;
}

interface DocsHeaderProps {
  isFullscreen: boolean;
  breadcrumb: string[];
  activeFile: SpecNode | null;
  viewMode: ViewMode;
  setViewMode: (m: ViewMode) => void;
  setEditContent: (c: string) => void;
  copied: boolean;
  theme: string;
  tree: SpecNode[];
  allCollapsed: boolean | null;
  handleCopyMarkdown: () => void;
  setIsFullscreen: React.Dispatch<React.SetStateAction<boolean>>;
  toggleTheme: () => void;
  setShowShortcuts: React.Dispatch<React.SetStateAction<boolean>>;
  toggleAllSections: () => void;
}

export function DocsHeader(props: DocsHeaderProps) {
  return (
    <header className="h-12 flex items-center gap-3 border-b border-border px-4 bg-background shrink-0">
      {!props.isFullscreen && <SidebarTrigger />}
      <BreadcrumbNav breadcrumb={props.breadcrumb} />
      <div className="flex items-center gap-0.5 shrink-0">
        {props.activeFile && <ViewModeToggle viewMode={props.viewMode} activeFile={props.activeFile} setViewMode={props.setViewMode} setEditContent={props.setEditContent} />}
        <ToolbarButtons activeFile={props.activeFile} copied={props.copied} isFullscreen={props.isFullscreen} theme={props.theme} tree={props.tree} allCollapsed={props.allCollapsed} handleCopyMarkdown={props.handleCopyMarkdown} setIsFullscreen={props.setIsFullscreen} toggleTheme={props.toggleTheme} setShowShortcuts={props.setShowShortcuts} toggleAllSections={props.toggleAllSections} />
      </div>
    </header>
  );
}

interface ContentPanelMainProps {
  deps: ContentPanelDeps;
  state: ReturnType<typeof useViewState>;
  split: ReturnType<typeof useSplitState>;
  activeFile: SpecNode | null;
  allFiles: SpecNode[];
  tree: SpecNode[];
  onSelect: (node: SpecNode) => void;
  allCollapsed: boolean | null;
  toggleAllSections: () => void;
}

function ContentPanelMain({ deps, state, split, activeFile, allFiles, tree, onSelect, allCollapsed, toggleAllSections }: ContentPanelMainProps) {
  return (
    <div className="flex-1 flex flex-col min-w-0">
      <DocsHeader isFullscreen={state.isFullscreen} breadcrumb={deps.breadcrumb} activeFile={activeFile} viewMode={state.viewMode} setViewMode={state.setViewMode} setEditContent={state.setEditContent} copied={state.copied} theme={deps.theme} tree={tree} allCollapsed={allCollapsed} handleCopyMarkdown={deps.handleCopyMarkdown} setIsFullscreen={state.setIsFullscreen} toggleTheme={deps.toggleTheme} setShowShortcuts={state.setShowShortcuts} toggleAllSections={toggleAllSections} />
      {activeFile && <ProgressBar progress={deps.readingProgress} />}
      <main ref={deps.mainRef} className="flex-1 overflow-auto">
        <DocsMainContent activeFile={activeFile} viewMode={state.viewMode} editContent={state.editContent} setEditContent={state.setEditContent} splitRatio={split.splitRatio} isFullscreen={state.isFullscreen} splitContainerRef={split.splitContainerRef} handleDividerMouseDown={deps.handleDividerMouseDown} handleScrollTo={deps.handleScrollTo} activeHeadingId={deps.activeHeadingId} allFiles={allFiles} onSelect={onSelect} allCollapsed={allCollapsed} />
      </main>
    </div>
  );
}

function isEditableTarget(target: HTMLElement): boolean {
  const tag = target.tagName;
  const isInputElement = tag === HtmlTag.Input || tag === HtmlTag.Textarea;

  return isInputElement || target.isContentEditable;
}

function useCollapseShortcut(toggleAll: () => void) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (isEditableTarget(e.target as HTMLElement)) {
        return;
      }

      if (e.ctrlKey || e.metaKey) {
        return;
      }

      if (e.key === KeyboardKeyType.C || e.key === KeyboardKeyType.ShiftC) {
        e.preventDefault();
        toggleAll();
      }
    };

    window.addEventListener("keydown", handler);

    return () => window.removeEventListener("keydown", handler);
  }, [toggleAll]);
}

export function DocsContentPanel(props: ContentPanelInput) {
  const deps = useContentPanelDeps(props);
  const { allCollapsed, toggleAll, resetCollapsible } = useCollapsibleState();
  useCollapseShortcut(toggleAll);

  return (
    <>
      {!props.state.isFullscreen && <DocsSidebar tree={props.tree} activePath={props.activeFile?.path ?? null} onSelect={props.onSelect} searchQuery={props.searchQuery} setSearchQuery={props.setSearchQuery} allFiles={props.allFiles} />}
      <ContentPanelMain deps={deps} state={props.state} split={props.split} activeFile={props.activeFile} allFiles={props.allFiles} tree={props.tree} onSelect={props.onSelect} allCollapsed={allCollapsed} toggleAllSections={toggleAll} />
      {props.state.showShortcuts && <ShortcutsOverlay onClose={() => props.state.setShowShortcuts(false)} />}
    </>
  );
}

export interface DocsContentProps {
  activeFile: SpecNode | null;
  allFiles: SpecNode[];
  tree: SpecNode[];
  onSelect: (node: SpecNode) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export function DocsContent({ activeFile, allFiles, tree, onSelect, searchQuery, setSearchQuery }: DocsContentProps) {
  const state = useViewState();
  const split = useSplitState();

  return <DocsContentPanel state={state} split={split} activeFile={activeFile} allFiles={allFiles} tree={tree} onSelect={onSelect} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />;
}
