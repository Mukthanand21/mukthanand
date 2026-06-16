import { useRef, useEffect, useCallback } from 'react';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

/* ─── star constants ─── */
const STAR_COUNT = 280;
const FIELD_DEPTH = 1200;
const FOCAL_LENGTH = 500;
const SPEED = 0.6;
const PARALLAX_FACTOR = 0.04;

/* ─── shooting star constants ─── */
const METEOR_INTERVAL_MIN = 3000;  // ms between meteors (min)
const METEOR_INTERVAL_MAX = 8000;  // ms between meteors (max)
const METEOR_DURATION = 1200;      // ms for a meteor to travel
const METEOR_TAIL_LENGTH = 80;     // pixels behind the head
const METEOR_SPEED = 6;            // pixels per frame

/* ─── color palette (warm gold tones) ─── */
const COLORS = [
  { r: 232, g: 182, b: 90 },  // gold accent #E8B65A
  { r: 243, g: 234, b: 239 }, // warm off-white #F3EAEF
  { r: 255, g: 230, b: 180 }, // warm gold
  { r: 200, g: 170, b: 120 }, // muted gold
  { r: 245, g: 220, b: 200 }, // warm cream
];

const METEOR_COLOR = { r: 255, g: 220, b: 150 }; // warm bright gold

type Star = {
  x: number;
  y: number;
  z: number;
  size: number;
  color: { r: number; g: number; b: number };
  twinkleSpeed: number;
  twinklePhase: number;
};

type Meteor = {
  x: number;
  y: number;
  dx: number;
  dy: number;
  age: number;       // ms since spawn
  lifetime: number;  // ms total
  active: boolean;
};

/* ─── generate a single star ─── */
function createStar(): Star {
  return {
    x: (Math.random() - 0.5) * 2000,
    y: (Math.random() - 0.5) * 1200,
    z: Math.random() * FIELD_DEPTH,
    size: Math.random() * 2 + 0.3,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    twinkleSpeed: Math.random() * 0.02 + 0.005,
    twinklePhase: Math.random() * Math.PI * 2,
  };
}

/* ─── spawn a shooting star at a random position ─── */
function spawnMeteor(w: number, h: number): Meteor {
  const margin = 60;
  // Spawn from top or left edges
  const fromTop = Math.random() > 0.5;
  const x = fromTop ? Math.random() * w : (Math.random() > 0.5 ? -margin : w + margin);
  const y = fromTop ? -margin : Math.random() * h;

  // Direction: downward-right, -0.5 to 0.5 rad from straight-down
  const angle = Math.PI / 2 + (Math.random() - 0.5) * 1.0;
  const speed = METEOR_SPEED * (0.8 + Math.random() * 0.6);
  const dx = Math.cos(angle) * speed;
  const dy = Math.sin(angle) * speed;

  return {
    x, y, dx, dy,
    age: 0,
    lifetime: METEOR_DURATION * (0.7 + Math.random() * 0.6),
    active: true,
  };
}

/* ============================================================
   Starfield — Canvas-based 3D starfield background.

   Renders stars flying slowly through 3D space with:
   - Gold/warm color palette matching the site accent
   - Mouse parallax: stars shift subtly with cursor
   - Subtle twinkle per star
   - Occasional shooting stars with gold tails
   - Respects prefers-reduced-motion (static render, no meteors)
   ============================================================ */
export function Starfield({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const starsRef = useRef<Star[]>([]);
  const meteorsRef = useRef<Meteor[]>([]);
  const spawnTimerRef = useRef<number>(-1);
  const rafRef = useRef(0);
  const lastTimeRef = useRef(0);
  const reduced = usePrefersReducedMotion();

  /* ─── initialise star field ─── */
  useEffect(() => {
    starsRef.current = Array.from({ length: STAR_COUNT }, createStar);
  }, []);

  /* ─── mouse tracking ─── */
  const handleMouse = useCallback((e: MouseEvent) => {
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

    // Schedule next meteor spawn
    const scheduleNext = () => {
      if (reduced) return;
      const delay = METEOR_INTERVAL_MIN + Math.random() * (METEOR_INTERVAL_MAX - METEOR_INTERVAL_MIN);
      spawnTimerRef.current = window.setTimeout(() => {
        const w = canvas.width;
        const h = canvas.height;
        meteorsRef.current.push(spawnMeteor(w, h));
        scheduleNext();
      }, delay) as unknown as number;
    };

    scheduleNext();
    lastTimeRef.current = performance.now();

    const drawFrame = () => {
      const w = canvas.width;
      const h = canvas.height;
      const mx = mouseRef.current.x * PARALLAX_FACTOR;
      const my = mouseRef.current.y * PARALLAX_FACTOR;
      const now = performance.now();

      ctx.clearRect(0, 0, w, h);

      /* ─── draw background stars ─── */
      const stars = starsRef.current;

      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];

        if (!reduced) {
          star.z -= SPEED;
        }

        if (star.z <= 0) {
          star.z = FIELD_DEPTH;
          star.x = (Math.random() - 0.5) * 2000;
          star.y = (Math.random() - 0.5) * 1200;
        }

        const scale = cx / (star.z + 1);
        const px = star.x * scale + w / 2 + mx * (FIELD_DEPTH - star.z) * 0.3;
        const py = star.y * scale + h / 2 + my * (FIELD_DEPTH - star.z) * 0.3;

        if (px < -10 || px > w + 10 || py < -10 || py > h + 10) continue;

        const size = Math.max(0.2, star.size * scale);
        const depthAlpha = Math.min(1, (1 - star.z / FIELD_DEPTH) * 2);

        const twinkle = reduced
          ? 1
          : 0.6 + 0.4 * Math.sin(star.twinklePhase + now * star.twinkleSpeed);

        const alpha = depthAlpha * twinkle;

        ctx.beginPath();
        ctx.arc(px, py, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${star.color.r}, ${star.color.g}, ${star.color.b}, ${alpha})`;
        ctx.fill();

        if (size > 1.2 && alpha > 0.5) {
          ctx.beginPath();
          ctx.arc(px, py, size * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${star.color.r}, ${star.color.g}, ${star.color.b}, ${alpha * 0.15})`;
          ctx.fill();
        }
      }

      /* ─── draw & update shooting stars ─── */
      if (!reduced) {
        const meteors = meteorsRef.current;
        const dt = Math.min(32, now - lastTimeRef.current); // cap at ~30fps to avoid jumps
        lastTimeRef.current = now;

        for (let i = meteors.length - 1; i >= 0; i--) {
          const m = meteors[i];
          m.age += dt;

          if (m.age >= m.lifetime) {
            meteors.splice(i, 1);
            continue;
          }

          // Position
          m.x += m.dx;
          m.y += m.dy;

          // Life progress 0→1
          const progress = m.age / m.lifetime;
          const fadeOut = 1 - progress; // fade toward end
          const headBright = fadeOut;

          // Draw trail
          const tailSteps = 20;
          for (let t = tailSteps; t >= 0; t--) {
            const frac = t / tailSteps;
            const tx = m.x - m.dx * frac * (METEOR_TAIL_LENGTH / METEOR_SPEED);
            const ty = m.y - m.dy * frac * (METEOR_TAIL_LENGTH / METEOR_SPEED);
            const trailAlpha = headBright * (1 - frac) * 0.7;

            if (trailAlpha < 0.01) continue;

            const radius = Math.max(0.5, 1.5 * (1 - frac * 0.7));
            ctx.beginPath();
            ctx.arc(tx, ty, radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${METEOR_COLOR.r}, ${METEOR_COLOR.g}, ${METEOR_COLOR.b}, ${trailAlpha})`;
            ctx.fill();
          }

          // Head glow
          ctx.beginPath();
          ctx.arc(m.x, m.y, 4, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${METEOR_COLOR.r}, ${METEOR_COLOR.g}, ${METEOR_COLOR.b}, ${headBright * 0.3})`;
          ctx.fill();

          // Bright head core
          ctx.beginPath();
          ctx.arc(m.x, m.y, 1.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 245, 230, ${headBright * 0.9})`;
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
      clearTimeout(spawnTimerRef.current);
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
