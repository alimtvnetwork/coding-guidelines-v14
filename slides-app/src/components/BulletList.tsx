import { motion } from "framer-motion";

interface BulletListProps {
  items: string[];
}

const item = {
  hidden: { opacity: 0, x: -16 },
  show: (delay: number) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export function BulletList({ items }: BulletListProps) {
  return (
    <ul
      style={{
        listStyle: "none",
        padding: 0,
        margin: 0,
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-3)",
        fontSize: 32,
        lineHeight: 1.4,
      }}
    >
      {items.map((text, i) => (
        <motion.li
          key={i}
          variants={item}
          initial="hidden"
          animate="show"
          custom={0.15 + i * 0.1}
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "var(--space-2)",
          }}
        >
          <span
            style={{
              color: "hsl(var(--accent))",
              fontWeight: 700,
              minWidth: 32,
            }}
          >
            ✓
          </span>
          <span>{text}</span>
        </motion.li>
      ))}
    </ul>
  );
}
