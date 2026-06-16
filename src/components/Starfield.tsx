import { useRef, useEffect, useCallback } from 'react';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

/* ─── star constants ─── */
const STAR_COUNT = 280;
const FIELD_DEPTH = 1200;     // z-range: 0 → FIELD_DEPTH
const FOCAL_LENGTH = 500;     // perspective projection
const SPEED = 0.6;            // fly-through speed per frame
const PARALLAX_FACTOR = 0.04; // mouse influence on star positions

/* ─── color palette (warm gold tones) ─── */
const COLORS = [
  { r: 232, g: 182, b: 90 },  // gold accent #E8B65A
  { r: 243, g: 234, b: 239 }, // warm off-white #F3EAEF
  { r: 255, g: 230, b: 180 }, // warm gold
  { r: 200, g: 170, b: 120 }, // muted gold
  { r: 245, g: 220, b: 200 }, // warm cream
];

type Star = {
  x: number;
  y: number;
  z: number;
  size: number;
  color: { r: number; g: number; b: number };
  twinkleSpeed: number;
  twinklePhase: number;
};

/* ─── generate a single star ─── */
function createStar(): Star {
  return {
    x: (Math.random() - 0.5) * 2000,  // spread across viewport
    y: (Math.random() - 0.5) * 1200,
    z: Math.random() * FIELD_DEPTH,
    size: Math.random() * 2 + 0.3,     // 0.3–2.3
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    twinkleSpeed: Math.random() * 0.02 + 0.005,
    twinklePhase: Math.random() * Math.PI * 2,
  };
}

/* ============================================================
   Starfield — Canvas-based 3D starfield background.

   Renders stars flying slowly through 3D space with:
   - Gold/warm color palette matching the site accent
   - Mouse parallax: stars shift subtly with cursor
   - Subtle twinkle per star
   - Varying size/depth perception
   - Respects prefers-reduced-motion (static render)
   ============================================================ */
export function Starfield({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const starsRef = useRef<Star[]>([]);
  const rafRef = useRef(0);
  const reduced = usePrefersReducedMotion();

  /* ─── initialise star field ─── */
  useEffect(() => {
    starsRef.current = Array.from({ length: STAR_COUNT }, createStar);
  }, []);

  /* ─── mouse tracking ─── */
  const handleMouse = useCallback((e: MouseEvent) => {
    // normalize to [-1, 1]
    mouseRef.current = {
      x: (e.clientX / window.innerWidth) * 2 - 1,
      y: (e.clientY / window.innerHeight) * 2 - 1,
    };
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouse, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouse);
  }, [handleMouse]);

  /* ─── animation loop ─── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const cx = FOCAL_LENGTH;

    const drawFrame = () => {
      const w = canvas.width;
      const h = canvas.height;
      const mx = mouseRef.current.x * PARALLAX_FACTOR;
      const my = mouseRef.current.y * PARALLAX_FACTOR;

      ctx.clearRect(0, 0, w, h);

      const stars = starsRef.current;
      const now = performance.now();

      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];

        // Move star toward viewer (skip in reduced motion)
        if (!reduced) {
          star.z -= SPEED;
        }

        // Wrap around when past viewer
        if (star.z <= 0) {
          star.z = FIELD_DEPTH;
          star.x = (Math.random() - 0.5) * 2000;
          star.y = (Math.random() - 0.5) * 1200;
        }

        // Perspective projection with mouse parallax offset
        const scale = cx / (star.z + 1);
        const px = star.x * scale + w / 2 + mx * (FIELD_DEPTH - star.z) * 0.3;
        const py = star.y * scale + h / 2 + my * (FIELD_DEPTH - star.z) * 0.3;

        // Skip if off-screen
        if (px < -10 || px > w + 10 || py < -10 || py > h + 10) continue;

        // Size and opacity based on depth
        const size = Math.max(0.2, star.size * scale);
        const depthAlpha = Math.min(1, (1 - star.z / FIELD_DEPTH) * 2);

        // Twinkle (static 1.0 in reduced motion)
        const twinkle = reduced
          ? 1
          : 0.6 + 0.4 * Math.sin(star.twinklePhase + now * star.twinkleSpeed);

        const alpha = depthAlpha * twinkle;

        // Draw star
        ctx.beginPath();
        ctx.arc(px, py, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${star.color.r}, ${star.color.g}, ${star.color.b}, ${alpha})`;
        ctx.fill();

        // Glow on brighter stars
        if (size > 1.2 && alpha > 0.5) {
          ctx.beginPath();
          ctx.arc(px, py, size * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${star.color.r}, ${star.color.g}, ${star.color.b}, ${alpha * 0.15})`;
          ctx.fill();
        }
      }

      if (!reduced) {
        rafRef.current = requestAnimationFrame(drawFrame);
      }
    };

    drawFrame();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [reduced]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
    />
  );
}
