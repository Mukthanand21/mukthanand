import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

/* ─── Register ScrollTrigger (safe if already registered) ─── */
gsap.registerPlugin(ScrollTrigger);

type RevealProps = {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  /** Horizontal offset direction — 'left' or 'right'. Defaults to 'up' (translateY). */
  direction?: 'up' | 'left' | 'right';
};

/* ============================================================
   Reveal — GSAP ScrollTrigger entrance animation.

   Replaces the Framer Motion `whileInView` pattern.
   Elements animate in once on scroll entry.
   Respects prefers-reduced-motion (static render, no transform).
   ============================================================ */
export function Reveal({ children, delay = 0, className, direction = 'up' }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced || !ref.current) return;

    const el = ref.current;

    /* ─── Compute initial transform based on direction ─── */
    const vars: gsap.TweenVars = {
      opacity: 0,
      duration: 0.8,
      ease: 'power2.out',
      delay,
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    };

    switch (direction) {
      case 'up':
        vars.y = 24;
        break;
      case 'left':
        vars.x = -24;
        break;
      case 'right':
        vars.x = 24;
        break;
    }

    const tween = gsap.fromTo(el, vars, { opacity: 1, y: 0, x: 0 });

    return () => {
      tween.kill();
      // Clean up the ScrollTrigger instance
      const st = tween.scrollTrigger;
      if (st) st.kill();
    };
  }, [reduced, delay, direction]);

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
