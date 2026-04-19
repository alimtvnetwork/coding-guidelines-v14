import { motion } from "framer-motion";
import type { ReactNode } from "react";

export interface SlideLayoutProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  notes?: string;
  footer?: ReactNode;
  children: ReactNode;
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export function SlideLayout({
  eyebrow,
  title,
  subtitle,
  footer,
  children,
}: SlideLayoutProps) {
  return (
    <>
      {eyebrow && (
        <motion.div
          className="eyebrow"
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={0.05}
        >
          {eyebrow}
        </motion.div>
      )}
      <motion.h1
        className="slide-title"
        variants={fadeUp}
        initial="hidden"
        animate="show"
        custom={0.15}
      >
        {title}
      </motion.h1>
      {subtitle && (
        <motion.div
          className="slide-subtitle"
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={0.25}
        >
          {subtitle}
        </motion.div>
      )}
      <motion.div
        className="slide-body"
        variants={fadeUp}
        initial="hidden"
        animate="show"
        custom={0.4}
      >
        {children}
      </motion.div>
      {footer && <div className="slide-footer">{footer}</div>}
    </>
  );
}
