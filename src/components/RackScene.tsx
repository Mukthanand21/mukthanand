import { useRef, useState, useEffect } from 'react';
import { useRackScene } from '../hooks/useRackScene';

/* ═══════════════════════════════════════════════════════
   RackScene — Global fixed WebGL backdrop

   Lives at viewport level (IndexPage / Layout). Scroll
   chapter transitions are driven by useRackScrollDirector
   via rackDirector module state read in useRackScene tick.
   ═══════════════════════════════════════════════════════ */

type RackSceneProps = {
  bootComplete?: boolean;
  /** Fixed full-viewport canvas behind all scroll content */
  global?: boolean;
};

export function RackScene({ bootComplete = false, global = false }: RackSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [webglAvailable, setWebglAvailable] = useState(true);

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

  useRackScene(bootComplete ? containerRef : { current: null }, { global });

  if (!webglAvailable || !bootComplete) return null;

  return (
    <div
      ref={containerRef}
      id="rack-scene-container"
      className="pointer-events-none"
      style={{
        position: global ? 'fixed' : 'absolute',
        top: 0,
        left: 0,
        width: global ? '100vw' : '100%',
        height: global ? '100dvh' : '100%',
        zIndex: global ? 0 : 0,
        overflow: 'hidden',
        opacity: 1,
        willChange: global ? 'opacity, transform' : undefined,
      }}
      aria-hidden="true"
    />
  );
}
