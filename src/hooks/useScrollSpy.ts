import { useEffect, useState, useRef } from 'react';

/* ═══════════════════════════════════════════════════════
   useScrollSpy — Tracks which section is currently in view
   using IntersectionObserver. Returns the active section ID.

   Options:
   - rootMargin: margin passed to IntersectionObserver (default: '-40% 0px -40% 0px')
     The nav height is ~52px + some buffer. This ensures the active section
     is the one occupying the majority of the viewport, not just peeked.
   - threshold: intersection ratio array (default: [0.25, 0.5, 0.75])
   ═══════════════════════════════════════════════════════ */

export function useScrollSpy(
  sectionIds: string[],
  options?: { rootMargin?: string; threshold?: number[] },
): string | null {
  const [activeId, setActiveId] = useState<string | null>(null);
  const entriesRef = useRef<Map<string, number>>(new Map());
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (sectionIds.length === 0) return;

    const rootMargin = options?.rootMargin ?? '-40% 0px -40% 0px';
    const threshold = options?.threshold ?? [0.25, 0.5, 0.75];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entriesRef.current.set(entry.target.id, entry.intersectionRatio);
        });

        // Batch update via rAF to avoid multiple state updates per frame
        if (rafRef.current === null) {
          rafRef.current = requestAnimationFrame(() => {
            rafRef.current = null;

            let maxId: string | null = null;
            let maxRatio = 0;

            entriesRef.current.forEach((ratio, id) => {
              if (ratio > maxRatio) {
                maxRatio = ratio;
                maxId = id;
              }
            });

            setActiveId(maxId);
          });
        }
      },
      { rootMargin, threshold },
    );

    const elements: (Element | null)[] = sectionIds.map((id) =>
      document.getElementById(id),
    );

    elements.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => {
      observer.disconnect();
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [sectionIds.join(',')]);

  return activeId;
}
