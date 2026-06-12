import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { BRAND_EASE, DURATION } from './easing';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

type RevealProps = {
  children: ReactNode;
  delay?: number;
  className?: string;
};

// Reusable scroll-triggered entrance using the single shared easing curve.
// Fully respects prefers-reduced-motion (renders statically, no transform).
export function Reveal({ children, delay = 0, className }: RevealProps) {
  const reduced = usePrefersReducedMotion();

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10% 0px' }}
      transition={{ duration: DURATION, ease: BRAND_EASE, delay }}
    >
      {children}
    </motion.div>
  );
}
