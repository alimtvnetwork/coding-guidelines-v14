import { motion } from "framer-motion";

export default function TitleSlide() {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        gap: "var(--space-4)",
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        style={{
          fontSize: 24,
          letterSpacing: "0.4em",
          textTransform: "uppercase",
          color: "hsl(var(--primary))",
          fontWeight: 700,
        }}
      >
        Code-Red Review Guide
      </motion.div>
      <motion.h1
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        style={{
          fontSize: 128,
          fontWeight: 700,
          margin: 0,
          lineHeight: 1.05,
          letterSpacing: "-0.02em",
        }}
      >
        10 transformations
        <br />
        <span style={{ color: "hsl(var(--accent))" }}>
          that make code reviewable
        </span>
      </motion.h1>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        style={{
          fontSize: 28,
          color: "hsl(var(--muted-fg))",
          marginTop: "var(--space-4)",
        }}
      >
        Md. Alim Ul Karim · Riseup Asia LLC
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ duration: 0.6, delay: 1.0 }}
        style={{
          fontSize: 22,
          color: "hsl(var(--muted-fg))",
          marginTop: "var(--space-5)",
        }}
      >
        Press → to begin
      </motion.div>
    </div>
  );
}
