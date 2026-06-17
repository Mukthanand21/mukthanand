import { useEffect, useRef } from 'react';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

/* ─── ticker items ─── */
const ITEMS = [
  '7 Projects Contributed',
  '17 MRs Merged',
  '40+ Issues Created',
  '350+ Total Commits',
  '10k+ Platform Users (corpus.swecha.org)',
  'Backend Engineer',
  'Full-Stack Developer',
];

const SEPARATOR = '  \u2022  ';
const SPEED = 0.4; // px per frame (~24px/sec as specified)

/* ============================================================
   Ticker — specs-v2/000-overview.md §4.4
   Continuous horizontal scroll, pauses on hover.
   ============================================================ */
export function Ticker() {
  const reduced = usePrefersReducedMotion();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reduced || !scrollRef.current) return;

    const el = scrollRef.current;
    let pos = 0;
    let raf: number;

    const animate = () => {
      pos -= SPEED;
      const half = el.scrollWidth / 2;
      if (Math.abs(pos) >= half) pos = 0;
      el.style.transform = `translateX(${pos}px)`;
      raf = requestAnimationFrame(animate);
    };

    raf = requestAnimationFrame(animate);

    const pause = () => cancelAnimationFrame(raf);
    const resume = () => { raf = requestAnimationFrame(animate); };

    el.addEventListener('mouseenter', pause);
    el.addEventListener('mouseleave', resume);

    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener('mouseenter', pause);
      el.removeEventListener('mouseleave', resume);
    };
  }, [reduced]);

  const content = ITEMS.join(SEPARATOR) + SEPARATOR;

  if (reduced) {
    return (
      <div className="overflow-hidden rounded-card border-thin border-border bg-bg-elevated px-4 py-3">
        <div className="whitespace-nowrap font-mono text-xs text-fg-muted">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-card border-thin border-border bg-bg-elevated px-4 py-3" aria-hidden="true">
      <div
        ref={scrollRef}
        className="inline-block whitespace-nowrap font-mono text-xs text-fg-muted will-change-transform"
      >
        {content}{content}
      </div>
    </div>
  );
}
