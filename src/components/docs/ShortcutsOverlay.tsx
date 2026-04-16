import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { KeyboardKeyType } from "@/constants/enums";

const SHORTCUTS = [
  { key: "← →", action: "Previous / Next file" },
  { key: "↑ ↓", action: "Previous / Next folder" },
  { key: "F", action: "Toggle fullscreen" },
  { key: "E", action: "Toggle Edit mode" },
  { key: "S", action: "Toggle Split mode" },
  { key: "P", action: "Switch to Preview mode" },
  { key: "C", action: "Toggle collapse / expand all" },
  { key: "?", action: "Toggle shortcuts help" },
  { key: "Esc", action: "Close overlay / exit fullscreen" },
];

function ShortcutRow({ shortcut }: { shortcut: { key: string; action: string } }) {
  return (
    <div className="flex items-center justify-between">
      <kbd className="bg-muted px-2 py-1 rounded text-sm font-mono border border-border">{shortcut.key}</kbd>
      <span className="text-sm text-muted-foreground">{shortcut.action}</span>
    </div>
  );
}

function useOverlayClose(onClose: () => void) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {

      if (e.key === KeyboardKeyType.Escape || e.key === KeyboardKeyType.QuestionMark) onClose();
    };

    window.addEventListener("keydown", handler);

    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);
}

function OverlayHeader({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-bold font-heading">Keyboard Shortcuts</h2>
      <Button variant="ghost" size="sm" onClick={onClose} className="text-muted-foreground">Esc</Button>
    </div>
  );
}

export function ShortcutsOverlay({ onClose }: { onClose: () => void }) {
  useOverlayClose(onClose);

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center" onClick={onClose}>
      <div className="bg-card border border-border rounded-lg shadow-lg p-6 max-w-sm w-full mx-4" onClick={e => e.stopPropagation()}>
        <OverlayHeader onClose={onClose} />
        <div className="space-y-3">
          {SHORTCUTS.map(s => <ShortcutRow key={s.key} shortcut={s} />)}
        </div>
      </div>
    </div>
  );
}
