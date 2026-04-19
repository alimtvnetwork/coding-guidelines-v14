import { SlideLayout } from "@/components/SlideLayout";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const STEPS = [
  {
    label: "Spec",
    detail: "spec/<area>/NN-name.md",
    color: "primary",
  },
  {
    label: "Issue",
    detail: "03-issues/NN-summary.md",
    color: "accent",
  },
  {
    label: "Code + PR",
    detail: "src/... + tests + linter clean",
    color: "destructive",
  },
];

export default function SpecFirstWorkflowSlide() {
  return (
    <SlideLayout
      eyebrow="Process"
      title="Spec → Issue → Code"
      subtitle="No code change without a spec entry or issue. Every transformation starts with a written commitment."
    >
      <div
        style={{
          display: "flex",
          alignItems: "stretch",
          justifyContent: "center",
          gap: "var(--space-3)",
          flex: 1,
          paddingTop: "var(--space-3)",
        }}
      >
        {STEPS.map((step, i) => (
          <div
            key={step.label}
            style={{ display: "flex", alignItems: "stretch", gap: "var(--space-3)" }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.5,
                delay: 0.2 + i * 0.4,
                ease: [0.22, 1, 0.36, 1],
              }}
              style={{
                background: "hsl(var(--bg-raised))",
                border: `2px solid hsl(var(--${step.color}) / 0.5)`,
                borderRadius: 20,
                padding: "var(--space-4)",
                minWidth: 360,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                gap: "var(--space-2)",
              }}
            >
              <div
                style={{
                  fontSize: 56,
                  fontWeight: 700,
                  color: `hsl(var(--${step.color}))`,
                }}
              >
                {step.label}
              </div>
              <div
                style={{
                  fontSize: 22,
                  color: "hsl(var(--muted-fg))",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {step.detail}
              </div>
            </motion.div>
            {i < STEPS.length - 1 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.4 + i * 0.4 }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  color: "hsl(var(--muted-fg))",
                }}
              >
                <ArrowRight size={48} />
              </motion.div>
            )}
          </div>
        ))}
      </div>
    </SlideLayout>
  );
}
