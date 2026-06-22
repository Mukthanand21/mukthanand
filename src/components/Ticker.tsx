import { useEffect, useRef } from 'react';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

/* ─── ticker item types ─── */
type TickerItem = {
  label: string;
  type: 'project' | 'stat';
};

/* ─── ticker items ─── */
const ITEMS: TickerItem[] = [
  { label: 'Ask Your Corpus', type: 'project' },
  { label: 'EHRS', type: 'project' },
  { label: 'Viswam AI', type: 'project' },
  { label: '17+ MRs Merged', type: 'stat' },
  { label: '7+ Repositories Contributed', type: 'stat' },
  { label: 'Backend Engineering', type: 'stat' },
  { label: 'Full-Stack Development', type: 'stat' },
  { label: 'AI Products', type: 'stat' },
  { label: 'Open Source Contributor', type: 'stat' },
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

    const isMobile = window.innerWidth < 768;
    const speed = isMobile ? SPEED * 0.5 : SPEED;

    const animate = () => {
      pos -= speed;
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

  if (reduced) {
    return (
      <div
        className="overflow-hidden rounded-card border-thin border-border bg-bg-elevated px-4 py-3"
        style={{
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04), inset 0 -1px 0 rgba(0,0,0,0.15)',
        }}
      >
        <div className="whitespace-nowrap font-mono text-xs md:text-sm">
          {renderItems(ITEMS)}
        </div>
      </div>
    );
  }

  return (
    <div
      className="overflow-hidden rounded-card border-thin border-border bg-bg-elevated px-4 py-3"
      aria-hidden="true"
      style={{
        maskImage: 'linear-gradient(to right, transparent 0%, rgb(0,0,0) 3%, rgb(0,0,0) 97%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to right, transparent 0%, rgb(0,0,0) 3%, rgb(0,0,0) 97%, transparent 100%)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04), inset 0 -1px 0 rgba(0,0,0,0.15)',
      }}
    >
      <div
        ref={scrollRef}
        className="inline-block whitespace-nowrap font-mono text-xs md:text-sm will-change-transform"
      >
        {renderItems([...ITEMS, ...ITEMS])}
      </div>
    </div>
  );
}

/* ─── render ticker items ─── */
function renderItems(items: TickerItem[]) {
  return items.map((item, i) => (
    <span key={i}>
      <span style={{ color: '#7a7974' }}>
        {item.label}
      </span>
      {i < items.length - 1 && (
        <span style={{ color: '#7a7974', margin: '0 0.6em' }}>
          {SEPARATOR.trim()}
        </span>
      )}
    </span>
  ));
}

