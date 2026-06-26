import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

type KineticSwapperProps = {
  prefix: string;
  words: string[];
  className?: string;
  /** Additional classes for the rotating word (e.g. text-accent for gold color) */
  wordClassName?: string;
  wordStyle?: React.CSSProperties;
  interval?: number;
  as?: 'h1' | 'h2' | 'h3' | 'span' | 'p' | 'div';
  style?: React.CSSProperties;
};

/* ============================================================
   KineticSwapper — Word rotation with vertical slide + fade.

   A static prefix sits before a rotating word that cycles
   through an array. Each word slides up/down with a spring
   ease. Respects prefers-reduced-motion (no animation).
   ============================================================ */
export function KineticSwapper({
  prefix,
  words,
  className = '',
  wordClassName = '',
  interval = 2200,
  as: Tag = 'h1',
  style,
  wordStyle,
}: KineticSwapperProps) {
  const [index, setIndex] = useState(0);
  const reduced = usePrefersReducedMotion();

  const tick = useCallback(() => {
    setIndex((prev) => (prev + 1) % words.length);
  }, [words.length]);

  useEffect(() => {
    if (reduced || words.length <= 1) return;
    const timer = setInterval(tick, interval);
    return () => clearInterval(timer);
  }, [tick, interval, reduced, words.length]);

  if (reduced || words.length === 0) {
    return (
      <Tag className={className} style={style}>
        {prefix} <span className={wordClassName} style={wordStyle}>{words[0] ?? ''}</span>
      </Tag>
    );
  }

  return (
    <Tag className={className} style={{ ...style, display: 'flex', flexWrap: 'wrap', gap: '0.25em' }}>
      <span>{prefix}&nbsp;</span>
      <span style={{ position: 'relative', display: 'inline-block', overflow: 'hidden', height: '1.2em' }}>
        <AnimatePresence mode="wait">
          <motion.span
            key={words[index]}
            className={wordClassName}
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -40, opacity: 0 }}
            transition={{
              y: { type: 'spring', stiffness: 200, damping: 20 },
              opacity: { duration: 0.25 },
            }}
            style={{ ...wordStyle, display: 'inline-block' }}
          >
            {words[index]}
          </motion.span>
        </AnimatePresence>
      </span>
    </Tag>
  );
}
