import { useEffect, useRef } from 'react';
import gsap from 'gsap';

/* ============================================================
   useKineticScroll — apply subtle skew to an element based on
   scroll velocity. The velocity is derived from tracking the
   scroll position delta over time in the animation loop.

   When the user scrolls fast, the element skews in the direction
   of the scroll. When scroll stops, it springs back to 0°.

   Usage:
     const skewRef = useKineticScroll<HTMLHeadingElement>();
     <h1 ref={skewRef}>Mukthanand</h1>
   ============================================================ */
export function useKineticScroll<T extends HTMLElement>(options?: {
  /** Maximum skew angle in degrees. Default: 3 */
  maxSkew?: number;
  /** Spring-back duration in seconds. Default: 0.4 */
  duration?: number;
  /** Threshold velocity (px per frame) for triggering skew. Default: 0.5 */
  threshold?: number;
}) {
  const ref = useRef<T>(null);
  const lastScrollY = useRef(0);
  const velocity = useRef(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const maxSkew = options?.maxSkew ?? 3;
    const duration = options?.duration ?? 0.4;
    const threshold = options?.threshold ?? 0.5;

    lastScrollY.current = window.scrollY;

    const animate = () => {
      const currentY = window.scrollY;
      // Velocity = pixels moved since last frame
      velocity.current = currentY - lastScrollY.current;
      lastScrollY.current = currentY;

      if (Math.abs(velocity.current) > threshold) {
        // Apply skew proportional to velocity, capped at maxSkew
        const skew = Math.max(-maxSkew, Math.min(maxSkew, -velocity.current * 0.3));
        gsap.to(el, {
          skewX: skew,
          duration: 0.05,
          overwrite: 'auto',
        });
      } else {
        // Spring back to 0
        gsap.to(el, {
          skewX: 0,
          duration,
          ease: 'power2.out',
          overwrite: 'auto',
        });
      }
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafRef.current);
      gsap.set(el, { skewX: 0 });
    };
  }, [options?.maxSkew, options?.duration, options?.threshold]);

  return ref;
}
