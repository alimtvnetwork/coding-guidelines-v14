import { useCallback } from "react";
import Editor from "@monaco-editor/react";
import { useTheme } from "@/components/ThemeProvider";
import { ThemeType } from "@/constants/enums";

interface MonacoMarkdownEditorProps {
  content: string;
  onChange: (value: string) => void;
}

const EDITOR_OPTIONS = {
  fontSize: 14,
  fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
  lineNumbers: "on" as const,
  minimap: { enabled: true, scale: 1 },
  wordWrap: "on" as const,
  scrollBeyondLastLine: false,
  padding: { top: 16, bottom: 16 },
  smoothScrolling: true,
  cursorBlinking: "smooth" as const,
  cursorSmoothCaretAnimation: "on" as const,
  renderLineHighlight: "all" as const,
  bracketPairColorization: { enabled: true },
  guides: { indentation: true, bracketPairs: true },
  scrollbar: { verticalScrollbarSize: 8, horizontalScrollbarSize: 8 },
  overviewRulerLanes: 0,
  hideCursorInOverviewRuler: true,
  renderWhitespace: "selection" as const,
  tabSize: 2,
};

function EditorLoading() {
  return (
    <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
      Loading editor…
    </div>
  );
}

function useEditorTheme(): string {
  const { theme } = useTheme();

  return theme === ThemeType.Dark ? "vs-dark" : "vs";
}

function useEditorChange(onChange: (value: string) => void) {
  return useCallback(
    (value: string | undefined) => {
      onChange(value ?? "");
    },
    [onChange]
  );
}

export function MonacoMarkdownEditor({ content, onChange }: MonacoMarkdownEditorProps) {
  const editorTheme = useEditorTheme();
  const handleChange = useEditorChange(onChange);

  return (
    <div className="h-full w-full rounded-lg overflow-hidden border border-border bg-card">
      <Editor height="100%" defaultLanguage="markdown" value={content} onChange={handleChange} theme={editorTheme} options={EDITOR_OPTIONS} loading={<EditorLoading />} />
    </div>
  );
}
