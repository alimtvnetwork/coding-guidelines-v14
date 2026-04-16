/**
 * Syntax-highlighted source view for raw markdown display.
 */
import React from "react";

const SYNTAX_STORAGE_KEY = "docs-syntax-theme";
const DARK_VALUE = "dark";

interface SyntaxTheme {
  bg: string;
  lineNum: string;
  heading: string;
  bold: string;
  inlineCode: string;
  link: string;
  blockquote: string;
  list: string;
  table: string;
  hr: string;
  codeFence: string;
  codeContent: string;
  text: string;
}

const SYNTAX_THEMES: Record<string, SyntaxTheme> = {
  light: {
    bg: "bg-white border-slate-200",
    lineNum: "text-slate-400",
    heading: "text-indigo-700 font-bold",
    bold: "text-indigo-600 font-semibold",
    inlineCode: "text-rose-600 bg-rose-50 rounded px-0.5",
    link: "text-blue-600 underline",
    blockquote: "text-slate-500 italic",
    list: "text-slate-700",
    table: "text-slate-500",
    hr: "text-slate-300",
    codeFence: "text-slate-400 italic",
    codeContent: "text-emerald-700",
    text: "text-slate-800",
  },
  dark: {
    bg: "bg-[hsl(230,15%,12%)] border-[hsl(230,10%,20%)]",
    lineNum: "text-[hsl(230,10%,35%)]",
    heading: "text-[hsl(252,90%,75%)] font-bold",
    bold: "text-[hsl(252,80%,70%)] font-semibold",
    inlineCode: "text-[hsl(0,80%,70%)] bg-[hsl(0,40%,15%)] rounded px-0.5",
    link: "text-[hsl(200,90%,65%)] underline",
    blockquote: "text-[hsl(230,10%,55%)] italic",
    list: "text-[hsl(230,10%,75%)]",
    table: "text-[hsl(230,10%,55%)]",
    hr: "text-[hsl(230,10%,30%)]",
    codeFence: "text-[hsl(230,10%,50%)] italic",
    codeContent: "text-[hsl(140,60%,65%)]",
    text: "text-[hsl(230,10%,85%)]",
  },
};

const LINE_NUM_BASE_CLASS = "inline-block w-10 text-right pr-4 shrink-0";
const INLINE_REGEX = /(\*\*[^*]+\*\*)|(`[^`]+`)|(\[[^\]]+\]\([^)]+\))/g;

interface RenderedLine {
  line: string;
  isCode: boolean;
  isCodeContent: boolean;
}

function classifyBlockLine(line: string, theme: SyntaxTheme): string {
  if (/^#{1,6}\s/.test(line)) return theme.heading;

  if (/^```/.test(line)) return theme.codeFence;

  if (/^>\s/.test(line)) return theme.blockquote;

  if (/^[-*]\s/.test(line) || /^\d+\.\s/.test(line)) return theme.list;

  if (/^\|/.test(line)) return theme.table;

  if (/^---\s*$/.test(line)) return theme.hr;

  return "";
}

function buildInlinePart(m: string, index: number, theme: SyntaxTheme): React.ReactNode {
  const className = m.startsWith("**") ? theme.bold : m.startsWith("`") ? theme.inlineCode : theme.link;

  return <span key={index} className={className}>{m}</span>;
}

interface InlineReduceContext {
  parts: React.ReactNode[];
  cursor: number;
  line: string;
  theme: SyntaxTheme;
}

function reduceInlineMatch(acc: InlineReduceContext, match: RegExpExecArray): InlineReduceContext {
  const prefix = match.index > acc.cursor ? acc.line.slice(acc.cursor, match.index) : null;
  const nextParts = prefix ? [...acc.parts, prefix] : acc.parts;

  return {
    ...acc,
    parts: [...nextParts, buildInlinePart(match[0], match.index, acc.theme)],
    cursor: match.index + match[0].length,
  };
}

function highlightInlineParts(line: string, theme: SyntaxTheme): React.ReactNode[] {
  const matches = Array.from(line.matchAll(INLINE_REGEX));

  if (matches.length === 0) return [];

  const { parts, cursor } = matches.reduce<InlineReduceContext>(
    (acc, match) => reduceInlineMatch(acc, match),
    { parts: [], cursor: 0, line, theme }
  );

  if (cursor < line.length) return [...parts, line.slice(cursor)];

  return parts;
}

function highlightLineWithTheme(line: string, theme: SyntaxTheme): React.ReactNode {
  const blockClass = classifyBlockLine(line, theme);

  if (blockClass) return <span className={blockClass}>{line}</span>;

  const parts = highlightInlineParts(line, theme);

  if (parts.length === 0) return <span className={theme.text}>{line}</span>;

  return <span className={theme.text}>{parts}</span>;
}

function parseSingleLine(line: string, isInsideCode: boolean): { entry: RenderedLine; isInsideCode: boolean } {
  if (/^```/.test(line)) {
    return { entry: { line, isCode: true, isCodeContent: false }, isInsideCode: !isInsideCode };
  }

  return { entry: { line, isCode: false, isCodeContent: isInsideCode }, isInsideCode };
}

function parseLines(content: string): RenderedLine[] {
  return content.split("\n").reduce<{ entries: RenderedLine[]; isInCode: boolean }>(
    (acc, line) => {
      const parsed = parseSingleLine(line, acc.isInCode);

      return { entries: [...acc.entries, parsed.entry], isInCode: parsed.isInsideCode };
    },
    { entries: [], isInCode: false }
  ).entries;
}

function useSyntaxTheme(): [boolean, () => void, SyntaxTheme] {
  const [isDark, setIsDark] = React.useState(() => {
    const stored = localStorage.getItem(SYNTAX_STORAGE_KEY);

    return stored !== null ? stored === DARK_VALUE : true;
  });

  React.useEffect(() => {
    localStorage.setItem(SYNTAX_STORAGE_KEY, isDark ? "dark" : "light");
  }, [isDark]);

  const toggle = React.useCallback(() => setIsDark(prev => !prev), []);
  const theme = isDark ? SYNTAX_THEMES.dark : SYNTAX_THEMES.light;

  return [isDark, toggle, theme];
}

function SyntaxThemeToggle({ isDark, onToggle }: { isDark: boolean; onToggle: () => void }) {
  return (
    <div className="flex items-center justify-end mb-2 gap-2">
      <span className="text-xs text-muted-foreground">Syntax theme</span>
      <button
        onClick={onToggle}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${isDark ? "bg-primary" : "bg-muted"}`}
        title={isDark ? "Switch to light syntax" : "Switch to dark syntax"}
      >
        <span className={`inline-block h-4 w-4 rounded-full bg-background shadow-sm transition-transform duration-200 ${isDark ? "translate-x-6" : "translate-x-1"}`} />
      </button>
      <span className="text-xs text-muted-foreground w-8">{isDark ? "Dark" : "Light"}</span>
    </div>
  );
}

function renderLineContent(entry: RenderedLine, theme: SyntaxTheme): React.ReactNode {
  if (entry.isCodeContent) {
    return <span className={theme.codeContent}>{entry.line || "\u00A0"}</span>;
  }

  return entry.line ? highlightLineWithTheme(entry.line, theme) : "\u00A0";
}

function SourceLine({ entry, index, theme }: { entry: RenderedLine; index: number; theme: SyntaxTheme }) {
  const lineNumClass = [LINE_NUM_BASE_CLASS, "select-none", theme.lineNum].join(" ");

  return (
    <div className="flex">
      <span className={lineNumClass}>{index + 1}</span>
      <span className="flex-1 whitespace-pre-wrap break-words">
        {renderLineContent(entry, theme)}
      </span>
    </div>
  );
}

function SourceCodeBlock({ lines, theme }: { lines: RenderedLine[]; theme: SyntaxTheme }) {
  return (
    <pre className={`rounded-lg border overflow-x-auto text-sm font-mono leading-relaxed transition-colors duration-200 ${theme.bg}`}>
      <code className="block p-4">
        {lines.map((entry, i) => (
          <SourceLine key={i} entry={entry} index={i} theme={theme} />
        ))}
      </code>
    </pre>
  );
}

export function SourceView({ content }: { content: string }) {
  const [isDark, toggleTheme, syntaxTheme] = useSyntaxTheme();
  const renderedLines = React.useMemo(() => parseLines(content), [content]);

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-5xl mx-auto px-6 py-6">
        <SyntaxThemeToggle isDark={isDark} onToggle={toggleTheme} />
        <SourceCodeBlock lines={renderedLines} theme={syntaxTheme} />
      </div>
    </div>
  );
}
