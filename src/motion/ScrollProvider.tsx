import { useEffect, useRef, type ReactNode } from 'react';
import { ReactLenis } from '@studio-freight/react-lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/* ─── Register GSAP plugins ─── */
gsap.registerPlugin(ScrollTrigger);

/* ============================================================
   ScrollProvider — syncs GSAP with Lenis for jitter-free
   scroll-linked animations. Wraps the entire app.

   Per the creative director's spec:
   "If you run Lenis and GSAP independently, your scroll-triggered
    animations will jitter because their requestAnimationFrame loops
    will fire out of sync. You must sync the GSAP ticker to Lenis."

   Usage: wrap <Layout /> (or the app root) with this component.
   ============================================================ */
export function ScrollProvider({ children }: { children: ReactNode }) {
  const lenisRef = useRef<any>(null);

  useEffect(() => {
    /* ─── Sync GSAP ticker to Lenis ─── */
    // This forces GSAP to use Lenis's scroll position, eliminating jitter.
    const update = (time: number) => {
      lenisRef.current?.lenis?.raf(time * 1000);
    };
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    /* ─── Refresh ScrollTrigger after Lenis settles ─── */
    const timeout = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 100);

    return () => {
      gsap.ticker.remove(update);
      clearTimeout(timeout);
    };
  }, []);

  return (
    <ReactLenis
      ref={lenisRef}
      root
      options={{
        lerp: 0.08,
        smoothWheel: true,
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      }}
    >
      {children}
    </ReactLenis>
  );
}
