import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

gsap.registerPlugin(ScrollTrigger);

type TransitionOptions = {
  start?: string;
  delay?: number;
  duration?: number;
  ease?: string;
  cardStagger?: number;
  cardOffset?: number;
};

export function useSectionTransition(
  sectionId: string,
  options: TransitionOptions = {},
) {
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();
  const animationRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const el = sectionRef.current;

    /* ─── Reduced motion: reveal everything immediately ─── */
    if (reduced) {
      el.querySelectorAll('[data-section-card]').forEach((card) => {
        gsap.set(card, { opacity: 1, y: 0, scale: 1 });
      });
      el.querySelectorAll('[data-section-label]').forEach((l) => {
        gsap.set(l, { opacity: 1, y: 0, letterSpacing: '0.08em' });
      });
      el.querySelectorAll('[data-section-title]').forEach((t) => {
        gsap.set(t, { opacity: 1, y: 0, clipPath: 'inset(0 0% 0 0)' });
      });
      return;
    }

    const start = options.start ?? 'top 82%';
    const cardStagger = options.cardStagger ?? 0.08;
    const cardOffset = options.cardOffset ?? 30;

    /* ─── Set initial card state to prevent flash ─── */
    const cards = el.querySelectorAll('[data-section-card]');
    if (cards.length > 0) {
      gsap.set(cards, { opacity: 0, y: cardOffset, scale: 0.97 });
    }

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: el,
        start,
        toggleActions: 'play none none none',
        invalidateOnRefresh: true,
      },
      delay: options.delay ?? 0,
      ease: options.ease ?? 'power3.out',
    });

    const label = el.querySelector('[data-section-label]');
    if (label) {
      tl.fromTo(
        label,
        { opacity: 0, y: 12, letterSpacing: '0.15em' },
        { opacity: 1, y: 0, letterSpacing: '0.08em', duration: 0.7, ease: 'power2.out' },
        0,
      );
    }

    const title = el.querySelector('[data-section-title]');
    if (title) {
      tl.fromTo(
        title,
        { clipPath: 'inset(0 100% 0 0)', y: 12, opacity: 0 },
        { clipPath: 'inset(0 0% 0 0)', y: 0, opacity: 1, duration: 1.0, ease: 'power3.out' },
        0.1,
      );
    }

    const desc = el.querySelector('[data-section-desc]');
    if (desc) {
      tl.fromTo(
        desc,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' },
        0.2,
      );
    }

    const accentLine = el.querySelector('[data-section-accent-line]');
    if (accentLine) {
      tl.fromTo(
        accentLine,
        { width: '0%', opacity: 0 },
        { width: '100%', opacity: 1, duration: 0.8, ease: 'power3.inOut' },
        0.25,
      );
    }

    if (cards.length > 0) {
      tl.to(cards, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.7,
        stagger: cardStagger,
        ease: 'power2.out',
      }, 0.3);
    }

    const meta = el.querySelector('[data-section-meta]');
    if (meta) {
      tl.fromTo(
        meta,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' },
        0.45,
      );
    }

    const fades = el.querySelectorAll('[data-section-fade]');
    if (fades.length > 0) {
      tl.fromTo(
        fades,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.06, ease: 'power2.out' },
        0.15,
      );
    }

    animationRef.current = tl;

    return () => {
      tl.kill();
      const st = tl.scrollTrigger;
      if (st) st.kill();
    };
  }, [reduced, sectionId, options.start, options.delay, options.ease, options.duration, options.cardStagger, options.cardOffset]);

  return sectionRef;
}
