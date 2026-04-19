import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface BeforeAfterProps {
  beforeLabel: string;
  afterLabel: string;
  before: ReactNode;
  after: ReactNode;
}

const fade = {
  hidden: { opacity: 0, x: -16 },
  show: (delay: number) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export function BeforeAfter({
  beforeLabel,
  afterLabel,
  before,
  after,
}: BeforeAfterProps) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "var(--space-4)",
        flex: 1,
        minHeight: 0,
      }}
    >
      <Pane label={beforeLabel} accent="destructive" delay={0.1}>
        {before}
      </Pane>
      <Pane label={afterLabel} accent="accent" delay={0.25}>
        {after}
      </Pane>
    </div>
  );
}

function Pane({
  label,
  accent,
  delay,
  children,
}: {
  label: string;
  accent: "destructive" | "accent";
  delay: number;
  children: ReactNode;
}) {
  return (
    <motion.div
      variants={fade}
      initial="hidden"
      animate="show"
      custom={delay}
      style={{
        background: "hsl(var(--bg-raised))",
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
      <div style={{ flex: 1, overflow: "auto", fontSize: 24 }}>{children}</div>
    </motion.div>
  );
}
