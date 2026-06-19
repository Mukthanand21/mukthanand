import { useRef, useState, useEffect } from 'react';
import { useRackScene } from '../hooks/useRackScene';

/* ═══════════════════════════════════════════════════════
   RackScene — React wrapper around the imperative Three.js
   server rack scene. Fixed to the viewport as a full-screen
   backdrop behind the hero section content.

   Per handoff note §3:
   - Canvas is fixed 100vw × 100vh behind all content
   - Uses IntersectionObserver (inside useRackScene) to pause
     rendering when hero is off-screen
   - Render loop synced to gsap.ticker instead of own rAF
   ═══════════════════════════════════════════════════════ */

type RackSceneProps = {
  bootComplete?: boolean;
};

export function RackScene({ bootComplete = false }: RackSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [webglAvailable, setWebglAvailable] = useState(true);

  /* ─── Feature detection ─── */
  useEffect(() => {
    try {
      const c = document.createElement('canvas');
      const supported = !!(window.WebGLRenderingContext &&
        (c.getContext('webgl') || c.getContext('experimental-webgl')));
      setWebglAvailable(supported);
    } catch {
      setWebglAvailable(false);
    }
  }, []);

  /* ─── Initialize Three.js scene only after boot completes ─── */
  useRackScene(bootComplete ? containerRef : { current: null });

  if (!webglAvailable || !bootComplete) return null;

  return (
    <div
      ref={containerRef}
      className="pointer-events-none"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        overflow: 'hidden',
      }}
      aria-hidden="true"
    />
  );
}