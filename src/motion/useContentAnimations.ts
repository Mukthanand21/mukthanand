import { useEffect } from 'react';
import gsap from 'gsap';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { contentDirector } from './contentDirector';

/* ═══════════════════════════════════════════════════════
   useContentAnimations — drives DOM content from contentDirector

   Subscribes to contentDirector and applies GSAP animations
   to section DOM elements based on the current content state:

   1. titleProgress → [data-section-label], [data-section-title],
      [data-section-accent-line] — opacity, letter-spacing, width

   2. cardProgress → [data-section-card] elements — staggered
      opacity + y entrance synced to the same scroll progress
      that drives the rack camera

   Designed to replace useSectionTransition (independent ScrollTrigger)
   and <Reveal> wrappers. Called once in IndexPage alongside
   useRackScrollDirector.
   ═══════════════════════════════════════════════════════ */

type Options = {
  /** Automatically set initial card states (opacity: 0, y: 24) on mount */
  autoInitCards?: boolean;
};

/* ─── Card state tracking — prevents re-animating already-visible cards ─── */
const VISIBLE_ATTR = 'data-section-card-visible';

/* ─── Clamp helper ─── */
function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/* ═══════════════════════════════════════════════════════
   Hook
   ═══════════════════════════════════════════════════════ */
export function useContentAnimations(options: Options = {}): void {
  const { autoInitCards = true } = options;
  const reduced = usePrefersReducedMotion();

  /* ─── Initialize cards on mount (set initial hidden state) ─── */
  useEffect(() => {
    if (reduced || !autoInitCards) return;

    // Small delay to ensure DOM is rendered
    const timer = setTimeout(() => {
      const allSections = document.querySelectorAll('[data-section-card]');
      allSections.forEach((card) => {
        if (card.getAttribute(VISIBLE_ATTR) !== 'true') {
          gsap.set(card, { opacity: 0, y: 24, scale: 0.98 });
        }
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [reduced, autoInitCards]);

  /* ─── Resolve elements after mount approach ───
   *  Instead of caching selectors (which go stale after React renders),
   *  we query the DOM fresh each time contentDirector fires.
   *  The subscribe callback is lightweight (no layout thrash). */
  function updateLabel(sectionEl: Element, titleProgress: number) {
    const label = sectionEl.querySelector('[data-section-label]');
    if (label) {
      gsap.to(label, {
        opacity: titleProgress,
        letterSpacing: `${0.15 - titleProgress * 0.05}em`,
        duration: 0.08,
        overwrite: 'auto',
        ease: 'none',
      });
    }

    const title = sectionEl.querySelector('[data-section-title]');
    if (title) {
      gsap.to(title, {
        opacity: titleProgress,
        y: 8 * (1 - titleProgress),
        clipPath: `inset(0 ${(1 - titleProgress) * 100}% 0 0)`,
        duration: 0.08,
        overwrite: 'auto',
        ease: 'none',
      });
    }

    const accentLine = sectionEl.querySelector('[data-section-accent-line]');
    if (accentLine) {
      gsap.to(accentLine, {
        width: `${clamp(titleProgress, 0, 1) * 100}%`,
        opacity: clamp(titleProgress * 1.5, 0, 1),
        duration: 0.08,
        overwrite: 'auto',
        ease: 'none',
      });
    }

    const desc = sectionEl.querySelector('[data-section-desc]');
    if (desc) {
      gsap.to(desc, {
        opacity: clamp(titleProgress * 1.5, 0, 1),
        y: 16 * (1 - clamp(titleProgress * 1.5, 0, 1)),
        duration: 0.08,
        overwrite: 'auto',
        ease: 'none',
      });
    }

    const meta = sectionEl.querySelector('[data-section-meta]');
    if (meta) {
      gsap.to(meta, {
        opacity: clamp(titleProgress * 2, 0, 1),
        y: 12 * (1 - clamp(titleProgress * 2, 0, 1)),
        duration: 0.08,
        overwrite: 'auto',
        ease: 'none',
      });
    }
  }

  function updateCards(sectionEl: Element, cardProgress: number) {
    const cards = sectionEl.querySelectorAll<HTMLElement>(
      `[data-section-card]:not([${VISIBLE_ATTR}="true"])`,
    );

    if (cards.length === 0) return;

    cards.forEach((card, i) => {
      const threshold = cards.length > 1 ? i / cards.length : 0;
      const visible = cardProgress > threshold;

      if (visible) {
        gsap.to(card, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.35,
          ease: 'power2.out',
          overwrite: 'auto',
        });
        card.setAttribute(VISIBLE_ATTR, 'true');
      }
    });
  }

  /* ─── Single subscribe to contentDirector ───
   *  Merges: title reveal, card stagger, and card reset on scroll-back.
   *  On reduced motion, reveals everything immediately instead. */
  useEffect(() => {
    // On reduced motion, reveal everything immediately
    if (reduced) {
      const allSections = document.querySelectorAll('section[id]');
      allSections.forEach((section) => {
        gsap.set(section.querySelector('[data-section-label]'), { opacity: 1, letterSpacing: '0.1em' });
        gsap.set(section.querySelector('[data-section-title]'), { opacity: 1, y: 0, clipPath: 'inset(0 0% 0 0)' });
        gsap.set(section.querySelector('[data-section-accent-line]'), { width: '100%', opacity: 1 });
        gsap.set(section.querySelector('[data-section-desc]'), { opacity: 1, y: 0 });
        gsap.set(section.querySelector('[data-section-meta]'), { opacity: 1, y: 0 });
        section.querySelectorAll('[data-section-card]').forEach((card) => {
          gsap.set(card, { opacity: 1, y: 0, scale: 1 });
          card.setAttribute(VISIBLE_ATTR, 'true');
        });
      });
      return;
    }

    const unsub = contentDirector.subscribe(() => {
      const state = contentDirector.current;

      /* ─── Reset cards on scroll-back ───
       *  When chapterProgress is near 0, the user has scrolled back
       *  to the previous section. Reset all visible cards so they
       *  can re-animate when scrolling forward again. */
      if (state.chapterProgress < 0.05 && state.chapterId) {
        const sectionEl = document.getElementById(state.chapterId);
        if (sectionEl) {
          sectionEl.querySelectorAll(`[${VISIBLE_ATTR}="true"]`).forEach((card) => {
            card.removeAttribute(VISIBLE_ATTR);
            gsap.set(card, { opacity: 0, y: 24, scale: 0.98 });
          });
        }
      }

      if (!state.chapterId) return;

      const sectionEl = document.getElementById(state.chapterId);
      if (!sectionEl) return;

      /* ─── Title / label / accent line reveal ─── */
      updateLabel(sectionEl, state.titleProgress);

      /* ─── Card stagger ─── */
      updateCards(sectionEl, state.cardProgress);
    });

    return unsub;
  }, [reduced]);
}
