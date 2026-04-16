import { useMemo, useEffect, useRef, useState } from "react";
import { renderMarkdown } from "./markdown/markdownParser";
import { useCodeBlockEvents } from "./markdown/useCodeBlockEvents";
import { useCollapsibleSections } from "@/hooks/useCollapsibleSections";
import { KeyboardKeyType } from "@/constants/enums";

interface MarkdownRendererProps {
  content: string;
  allCollapsed?: boolean | null;
  filePath?: string;
}

function handleEscapeKey(e: KeyboardEvent, onEscape: () => void): void {
  if (e.key !== KeyboardKeyType.Escape) return;
  onEscape();
}

function useEscapeFullscreen(
  isActive: boolean,
  onEscape: () => void
): void {
  useEffect(() => {
    if (!isActive) return;
    const handler = (e: KeyboardEvent) => handleEscapeKey(e, onEscape);
    window.addEventListener("keydown", handler);

    return () => window.removeEventListener("keydown", handler);
  }, [isActive, onEscape]);
}

function useSyncFullscreenClass(
  containerRef: React.RefObject<HTMLDivElement>,
  fullscreenBlock: string | null,
  html: string
): void {
  useEffect(() => {
    if (!containerRef.current) return;
    const blocks = containerRef.current.querySelectorAll(".code-block-wrapper");
    blocks.forEach((block) => {
      const id = (block as HTMLElement).dataset.blockId;
      const isTarget = id === fullscreenBlock;
      block.classList.toggle("code-fullscreen", isTarget);
    });
  }, [fullscreenBlock, html]);
}

export function MarkdownRenderer({ content, allCollapsed = null, filePath }: MarkdownRendererProps) {
  const html = useMemo(() => renderMarkdown(content), [content]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [fullscreenBlock, setFullscreenBlock] = useState<string | null>(null);

  useCodeBlockEvents(containerRef, html, setFullscreenBlock);
  useEscapeFullscreen(!!fullscreenBlock, () => setFullscreenBlock(null));
  useSyncFullscreenClass(containerRef, fullscreenBlock, html);
  useCollapsibleSections(containerRef, html, allCollapsed, filePath);

  return (
    <>
      <div ref={containerRef} className="prose-spec max-w-none" dangerouslySetInnerHTML={{ __html: html }} />
      {fullscreenBlock && <div className="code-fullscreen-overlay" onClick={() => setFullscreenBlock(null)} />}
    </>
  );
}
