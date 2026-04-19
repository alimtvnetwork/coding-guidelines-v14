import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { codeToHtml } from "shiki";

export interface CodeDiffProps {
  language: string;
  before: string;
  after: string;
  beforeLabel?: string;
  afterLabel?: string;
  layout?: "side-by-side" | "stacked";
}

const fade = {
  hidden: { opacity: 0, x: -16 },
  show: (delay: number) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export function CodeDiff({
  language,
  before,
  after,
  beforeLabel = "❌ Before",
  afterLabel = "✅ After",
  layout = "side-by-side",
}: CodeDiffProps) {
  const [beforeHtml, setBeforeHtml] = useState("");
  const [afterHtml, setAfterHtml] = useState("");

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      codeToHtml(before, { lang: language, theme: "github-dark" }),
      codeToHtml(after, { lang: language, theme: "github-dark" }),
    ]).then(([b, a]) => {
      if (cancelled) return;
      setBeforeHtml(b);
      setAfterHtml(a);
    });
    return () => {
      cancelled = true;
    };
  }, [before, after, language]);

  const isStacked = layout === "stacked";
  return (
    <div
      className="code-diff"
      style={{
        display: "grid",
        gridTemplateColumns: isStacked ? "1fr" : "1fr 1fr",
        gap: "var(--space-4)",
        flex: 1,
        minHeight: 0,
      }}
    >
      <DiffPanel
        label={beforeLabel}
        html={beforeHtml}
        accent="destructive"
        delay={0.1}
      />
      <DiffPanel
        label={afterLabel}
        html={afterHtml}
        accent="accent"
        delay={0.25}
      />
    </div>
  );
}

interface DiffPanelProps {
  label: string;
  html: string;
  accent: "destructive" | "accent";
  delay: number;
}

function DiffPanel({ label, html, accent, delay }: DiffPanelProps) {
  return (
    <motion.div
      variants={fade}
      initial="hidden"
      animate="show"
      custom={delay}
      style={{
        background: "hsl(var(--code-bg))",
        border: `2px solid hsl(var(--${accent}) / 0.4)`,
        borderRadius: 16,
        padding: "var(--space-3)",
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
      }}
    >
      <div
        style={{
          fontSize: 24,
          fontWeight: 700,
          color: `hsl(var(--${accent}))`,
          marginBottom: "var(--space-2)",
        }}
      >
        {label}
      </div>
      <div
        className="shiki-host"
        style={{ fontSize: 26, lineHeight: 1.5, overflow: "auto", flex: 1 }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </motion.div>
  );
}
