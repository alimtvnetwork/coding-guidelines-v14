import { SlideLayout } from "@/components/SlideLayout";
import { motion } from "framer-motion";

const BARS = [
  { label: "Before — 1 monster function", value: 73, color: "destructive" },
  { label: "After — fn A", value: 12, color: "accent" },
  { label: "After — fn B", value: 9, color: "accent" },
  { label: "After — fn C", value: 11, color: "accent" },
  { label: "After — fn D", value: 8, color: "accent" },
];

const MAX = 80;

export default function FunctionAndFileMetricsSlide() {
  return (
    <SlideLayout
      eyebrow="Code Red"
      title="Small files, small functions"
      subtitle="Functions 8–15 lines · Files < 300 lines · React components < 100 lines. If it doesn't fit, decompose."
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-3)",
          fontSize: 24,
        }}
      >
        {BARS.map((bar, i) => (
          <div
            key={i}
            style={{
              display: "grid",
              gridTemplateColumns: "360px 1fr 80px",
              alignItems: "center",
              gap: "var(--space-2)",
            }}
          >
            <div style={{ color: "hsl(var(--muted-fg))" }}>{bar.label}</div>
            <div
              style={{
                background: "hsl(var(--bg-raised))",
                borderRadius: 8,
                height: 40,
                overflow: "hidden",
                position: "relative",
              }}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(bar.value / MAX) * 100}%` }}
                transition={{
                  duration: 0.8,
                  delay: 0.3 + i * 0.12,
                  ease: [0.22, 1, 0.36, 1],
                }}
                style={{
                  background: `hsl(var(--${bar.color}))`,
                  height: "100%",
                  borderRadius: 8,
                }}
              />
            </div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontWeight: 700,
                color: `hsl(var(--${bar.color}))`,
                textAlign: "right",
              }}
            >
              {bar.value} L
            </div>
          </div>
        ))}
      </div>
    </SlideLayout>
  );
}
