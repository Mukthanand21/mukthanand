import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

/* ─── Register ScrollTrigger ─── */
gsap.registerPlugin(ScrollTrigger);

/* ═══════════════════════════════════════════════════════
   useSectionTransition — per-section cinematic entrance

   Creates a GSAP timeline for the given section that:
   1. Reveals the section label (/status, /services, etc.)
      with a letter-spacing + fade animation
   2. Staggers in content elements (headings, cards, etc.)
   3. Animates a gold accent line from 0 → full width
   4. Fades in bottom metadata/metrics

   Each element is targeted by a data attribute selector
   within the section container.

   Usage:
     const sectionRef = useSectionTransition('status');

     <section ref={sectionRef} id="status">
       <p data-section-label>/status</p>
       <h1>Title</h1>
       ...
     </section>
   ═══════════════════════════════════════════════════════ */

type TransitionOptions = {
  /** Offset from viewport bottom to trigger entrance (default 'top 82%') */
  start?: string;
  /** Delay before animation begins (seconds, default 0) */
  delay?: number;
  /** Duration of the full timeline (seconds, default 1.2) */
  duration?: number;
  /** Custom easing (default 'power2.out') */
  ease?: string;
};

export function useSectionTransition(
  sectionId: string,
  options: TransitionOptions = {},
) {
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();
  const animationRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    if (reduced || !sectionRef.current) return;

    const el = sectionRef.current;
    const start = options.start ?? 'top 82%';

    /* ─── Build the timeline ─── */
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: el,
        start,
        toggleActions: 'play none none none',
      },
      delay: options.delay ?? 0,
      ease: options.ease ?? 'power2.out',
    });

    /* ─── Section label: fade-in with letter-spacing tighten ─── */
    const label = el.querySelector('[data-section-label]');
    if (label) {
      tl.fromTo(
        label,
        { opacity: 0, letterSpacing: '0.15em' },
        { opacity: 1, letterSpacing: '0.1em', duration: 0.6, ease: 'power2.out' },
        0,
      );
    }

    /* ─── Section title / hero text: clip-path reveal ─── */
    const title = el.querySelector('[data-section-title]');
    if (title) {
      tl.fromTo(
        title,
        { clipPath: 'inset(0 100% 0 0)', y: 8, opacity: 0 },
        { clipPath: 'inset(0 0% 0 0)', y: 0, opacity: 1, duration: 0.8, ease: 'power2.out' },
        0.1,
      );
    }

    /* ─── Description / subtitle ─── */
    const desc = el.querySelector('[data-section-desc]');
    if (desc) {
      tl.fromTo(
        desc,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
        0.25,
      );
    }

    /* ─── Gold accent line ─── */
    const accentLine = el.querySelector('[data-section-accent-line]');
    if (accentLine) {
      tl.fromTo(
        accentLine,
        { width: '0%', opacity: 0 },
        { width: '100%', opacity: 1, duration: 0.7, ease: 'power3.out' },
        0.3,
      );
    }

    /* ─── Content cards / grid items ───
         NOTE: Card staggering is intentionally skipped here because
         sections (Services, Changelog, Contact, Stack) already handle
         their own entrance animations via <Reveal> or Framer Motion.
         Enabling card stagger here would conflict with those animations,
         causing visual flicker (the .fromTo resets elements to hidden).
         If a section needs custom card entrance, add data-section-card
         and handle it in that section's specific animation hook. */

    /* ─── Bottom metadata / metrics ─── */
    const meta = el.querySelector('[data-section-meta]');
    if (meta) {
      tl.fromTo(
        meta,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' },
        0.5,
      );
    }

    /* ─── Any custom elements with data-section-fade ─── */
    const fades = el.querySelectorAll('[data-section-fade]');
    if (fades.length > 0) {
      tl.fromTo(
        fades,
        { opacity: 0, y: 12 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.06,
          ease: 'power2.out',
        },
        0.2,
      );
    }

    animationRef.current = tl;

    return () => {
      tl.kill();
      const st = tl.scrollTrigger;
      if (st) st.kill();
    };
  }, [reduced, sectionId, options.start, options.delay, options.ease, options.duration]);

  return sectionRef;
}

/* ═══════════════════════════════════════════════════════
   useSectionTransitions — Consolidated cinematic transitions

   Takes an array of transition definitions and creates
   GSAP ScrollTrigger-timelines for each. Used by IndexPage
   to animate transition overlays between sections.

   Each transition:
   - gold-sweep: horizontal gold light bar sweeps across
   - iris-wipe: clip-path circle grows to reveal next section
   - parallax-shift: content skews + slides
   ═══════════════════════════════════════════════════════ */

export type TransitionDef = {
  from: string;
  to: string;
  id: string;
  type: 'gold-sweep';
};

export function useSectionTransitions(transitions: TransitionDef[], bootComplete = true) {
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (!bootComplete) return;
    if (reduced) return;

    const timestamps: gsap.core.Timeline[] = [];

    transitions.forEach((t) => {
      const fromEl = document.getElementById(t.from);
      const toEl = document.getElementById(t.to);
      const overlayEl = document.getElementById(t.id);

      if (!fromEl || !toEl || !overlayEl) return;

      const isMobile = window.innerWidth < 768;

      const tl = gsap.timeline({
        scrollTrigger: {
          id: `transition-${t.id}`,
          trigger: fromEl,
          start: 'bottom bottom',
          end: () => `bottom ${toEl.id === 'contact' ? '-=100' : '+=200'}`,
          scrub: isMobile ? 0.5 : 1.2,
          invalidateOnRefresh: true,
        },
      });

      tl.fromTo(
        overlayEl,
        { x: '-100%', opacity: 0 },
        { x: '0%', opacity: isMobile ? 0.35 : 0.5, duration: 0.5, ease: 'power2.inOut' },
      )
        .to(overlayEl, { opacity: isMobile ? 0.15 : 0.25, duration: 0.2 }, 0.45)
        .to(overlayEl, { x: '100%', opacity: 0, duration: 0.5, ease: 'power2.in' }, 0.65);

      timestamps.push(tl);
    });

    return () => {
      transitions.forEach((t) => {
        const st = ScrollTrigger.getById(`transition-${t.id}`);
        if (st) st.kill();
      });
      timestamps.forEach((tl) => tl.kill());
    };
  }, [reduced, transitions, bootComplete]);
}

/* ═══════════════════════════════════════════════════════
   useSectionTransitionOverlay — Single overlay (backward compatible)
   ═══════════════════════════════════════════════════════ */

type OverlayOptions = {
  sectionA: string;
  sectionB: string;
  overlayId: string;
};

export function useSectionTransitionOverlay({
  sectionA,
  sectionB,
  overlayId,
}: OverlayOptions) {
  useSectionTransitions([{
    from: sectionA,
    to: sectionB,
    id: overlayId,
    type: 'gold-sweep',
  }]);
}
