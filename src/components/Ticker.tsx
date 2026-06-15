import { useEffect, useRef, useState } from 'react';

/* ─── ticker content ─── */
const TICKER_ITEMS = [
  'OPEN TO SOFTWARE, AI & FULL-STACK OPPORTUNITIES',
  'GRADUATING JULY 2025',
  'CURRENTLY: HYBRID RETRIEVAL @ CORPUS.SWECHA.ORG',
  'BUILT WITH REACT + VITE + TAILWIND',
  'CI/CD VIA GITLAB PAGES',
];

const ITEM_SEPARATOR = '✦';

/* ─── continuous horizontal scroll ticker ─── */
export function Ticker() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let animationId: number;
    let scrollPos = 0;
    const speed = 0.4; // px per frame (~24px/sec at 60fps)

    const tick = () => {
      if (!container) return;
      if (!isHovered) {
        scrollPos += speed;
        container.scrollLeft = scrollPos;

        // Reset to beginning when we've scrolled past one copy
        const halfScroll = container.scrollWidth / 2;
        if (scrollPos >= halfScroll) {
          scrollPos = 0;
          container.scrollLeft = 0;
        }
      }
      animationId = requestAnimationFrame(tick);
    };

    animationId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(animationId);
  }, [isHovered]);

  // Double the items for seamless loop
  const displayedItems = [...TICKER_ITEMS, ...TICKER_ITEMS];

  return (
    <div
      ref={containerRef}
      className="overflow-hidden border-y border-border py-3"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="marquee"
      aria-live="off"
    >
      <div className="flex w-max gap-8">
        {displayedItems.map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="inline-flex shrink-0 items-center gap-8 font-mono text-xs uppercase tracking-widest text-fg-muted"
          >
            <span>{item}</span>
            {i < displayedItems.length - 1 && (
              <span className="text-fg-faint/40" aria-hidden="true">
                {ITEM_SEPARATOR}
              </span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}
