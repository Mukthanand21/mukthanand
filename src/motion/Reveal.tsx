import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

// V2 easing tokens (mirrors --ease-spring in tokens.css)
const SPRING_EASE = [0.16, 1, 0.3, 1] as const;
const REVEAL_DURATION = 0.5;

type RevealProps = {
  children: ReactNode;
  delay?: number;
  className?: string;
};

// Reusable scroll-triggered entrance using the v2 spring easing curve.
// Fully respects prefers-reduced-motion (renders statically, no transform).
export function Reveal({ children, delay = 0, className }: RevealProps) {
  const reduced = usePrefersReducedMotion();

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10% 0px' }}
      transition={{ duration: REVEAL_DURATION, ease: SPRING_EASE, delay }}
    >
      {children}
    </motion.div>
  );
}
