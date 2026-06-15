import { useEffect, useRef } from 'react';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

/* ─── Magnetic tilt hover effect ───
 * Tilts the card toward the cursor using perspective + rotateX/Y.
 * Intensity controls the max tilt angle in degrees (default 8).
 * Auto-resets on mouseleave with a spring-like transition.
 * Skipped entirely when the user prefers reduced motion.
 * ============================================================ */
export function useMagneticTilt<T extends HTMLElement>(intensity = 8) {
  const ref = useRef<T>(null!);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;

    const SPRING_EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      const tiltX = (y / (rect.height / 2)) * intensity;
      const tiltY = -(x / (rect.width / 2)) * intensity;
      el.style.transform =
        `perspective(600px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-2px)`;
    };

    const onEnter = () => {
      el.style.transition = 'background 0.15s, border-color 0.15s';
    };

    const onLeave = () => {
      el.style.transition = `transform 0.4s ${SPRING_EASE}, background 0.15s, border-color 0.15s`;
      el.style.transform = 'perspective(600px) rotateX(0deg) rotateY(0deg) translateY(0)';
    };

    el.addEventListener('mouseenter', onEnter);
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);

    return () => {
      el.removeEventListener('mouseenter', onEnter);
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
    };
  }, [intensity, reduced]);

  return ref;
}
