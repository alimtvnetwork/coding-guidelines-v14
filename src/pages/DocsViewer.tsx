import { useState, useCallback } from "react";
import { useSpecData } from "@/hooks/useSpecData";
import type { SpecNode } from "@/types/spec";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DocsContent } from "@/pages/DocsViewerComponents";
import { useDeepLinkFile, useFileSelection } from "@/pages/DocsViewerHelpers";
import { SearchDialog, useSearchShortcut } from "@/components/docs/SearchDialog";

function useDocsViewerState(allFiles: SpecNode[]) {
  const [activeFile, setActiveFile] = useState<SpecNode | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  useDeepLinkFile(allFiles, setActiveFile);
  const handleSelect = useFileSelection(setActiveFile, setSearchQuery);
  useSearchShortcut(useCallback(() => setSearchOpen(true), []));

  const handleSearchSelect = useCallback((node: SpecNode) => {
    handleSelect(node);
    setSearchOpen(false);
  }, [handleSelect]);

  return { activeFile, searchQuery, setSearchQuery, searchOpen, setSearchOpen, handleSelect, handleSearchSelect };
}

export default function DocsViewer() {
  const { tree, allFiles } = useSpecData();
  const state = useDocsViewerState(allFiles);

  return (
    <SidebarProvider>
        <div className="min-h-screen flex flex-col w-full">
          <div className="flex-1 flex w-full">
            <DocsContent activeFile={state.activeFile} allFiles={allFiles} tree={tree} onSelect={state.handleSelect} searchQuery={state.searchQuery} setSearchQuery={state.setSearchQuery} />
          </div>
          <footer className="border-t border-border py-4 text-center text-sm text-muted-foreground space-y-1">
            <p>
              Built by{" "}
              <a href="https://alimkarim.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">Md. Alim Ul Karim</a>
              {" "}— Chief Software Engineer,{" "}
              <a href="https://riseup-asia.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">Riseup Asia LLC</a>
            </p>
          </footer>
        </div>
      <SearchDialog open={state.searchOpen} onOpenChange={state.setSearchOpen} allFiles={allFiles} onSelect={state.handleSearchSelect} />
    </SidebarProvider>
  );
}
