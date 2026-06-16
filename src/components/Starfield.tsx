import { useRef, useEffect, useCallback } from 'react';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

/* ─── star constants ─── */
const STAR_COUNT = 280;
const FIELD_DEPTH = 1200;
const FOCAL_LENGTH = 500;
const SPEED = 0.6;
const PARALLAX_FACTOR = 0.04;

/* ─── shooting star constants ─── */
const METEOR_INTERVAL_MIN = 3000;
const METEOR_INTERVAL_MAX = 8000;

type MeteorStyle = 'gold-streak' | 'violet-comet';

type MeteorConfig = {
  color: { r: number; g: number; b: number };
  headCore: { r: number; g: number; b: number };
  speed: number;
  lifetime: number;      // ms base
  tailLength: number;    // pixels
  tailDots: number;
  headGlowRadius: number;
  headCoreRadius: number;
  fragments: boolean;
};

const METEOR_STYLES: Record<MeteorStyle, MeteorConfig> = {
  'gold-streak': {
    color: { r: 255, g: 220, b: 150 },
    headCore: { r: 255, g: 245, b: 230 },
    speed: 6,
    lifetime: 1200,
    tailLength: 80,
    tailDots: 20,
    headGlowRadius: 4,
    headCoreRadius: 1.5,
    fragments: false,
  },
  'violet-comet': {
    color: { r: 180, g: 140, b: 255 },  // soft violet #B48CFF
    headCore: { r: 220, g: 200, b: 255 }, // light violet core
    speed: 3.5,
    lifetime: 2200,
    tailLength: 180,
    tailDots: 30,
    headGlowRadius: 6,
    headCoreRadius: 2,
    fragments: true,
  },
};

const STYLE_KEYS = Object.keys(METEOR_STYLES) as MeteorStyle[];

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

type Fragment = {
  x: number;
  y: number;
  dx: number;
  dy: number;
  life: number;     // 0→1
  decay: number;    // how fast life decreases per frame
  size: number;
};

type Meteor = {
  x: number;
  y: number;
  dx: number;
  dy: number;
  age: number;
  lifetime: number;
  style: MeteorStyle;
  fragments: Fragment[];
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

/* ─── spawn a shooting star ─── */
function spawnMeteor(w: number, h: number): Meteor {
  const style = STYLE_KEYS[Math.floor(Math.random() * STYLE_KEYS.length)];
  const cfg = METEOR_STYLES[style];
  const margin = 60;

  // Gold streaks spawn from top/left; violet comets spawn from any edge
  let sx: number, sy: number;
  if (style === 'gold-streak') {
    const fromTop = Math.random() > 0.5;
    sx = fromTop ? Math.random() * w : (Math.random() > 0.5 ? -margin : w + margin);
    sy = fromTop ? -margin : Math.random() * h;
  } else {
    const edge = Math.floor(Math.random() * 4); // 0:top, 1:right, 2:bottom, 3:left
    sx = edge === 0 ? Math.random() * w : edge === 1 ? w + margin : edge === 3 ? -margin : Math.random() * w;
    sy = edge === 0 ? -margin : edge === 1 ? Math.random() * h : edge === 2 ? h + margin : Math.random() * h;
  }

  // Direction: gold goes downward-right, violet goes more horizontal
  const baseAngle = style === 'gold-streak' ? Math.PI / 2 : Math.PI * 0.6;
  const angle = baseAngle + (Math.random() - 0.5) * 0.8;
  const speed = cfg.speed * (0.8 + Math.random() * 0.6);
  const dx = Math.cos(angle) * speed;
  const dy = Math.sin(angle) * speed;

  return {
    x: sx, y: sy, dx, dy,
    age: 0,
    lifetime: cfg.lifetime * (0.7 + Math.random() * 0.6),
    style,
    fragments: [],
  };
}

/* ============================================================
   Starfield — Canvas-based 3D starfield background.

   Two meteor styles:
   - Gold Streak: quick, bright gold, short tail
   - Violet Comet: slow, violet, long tail with fragment particles
   ============================================================ */
export function Starfield({ className = '', fixed = false }: { className?: string; fixed?: boolean }) {
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

    const scheduleNext = () => {
      if (reduced) return;
      const delay = METEOR_INTERVAL_MIN + Math.random() * (METEOR_INTERVAL_MAX - METEOR_INTERVAL_MIN);
      spawnTimerRef.current = window.setTimeout(() => {
        meteorsRef.current.push(spawnMeteor(canvas.width, canvas.height));
        scheduleNext();
      }, delay) as unknown as number;
    };

    scheduleNext();
    lastTimeRef.current = performance.now();

    const drawFrame = () => {
      // Pause when tab is hidden — saves battery/CPU
      if (document.hidden) {
        lastTimeRef.current = performance.now();
        rafRef.current = requestAnimationFrame(drawFrame);
        return;
      }

      const w = canvas.width;
      const h = canvas.height;
      const mx = mouseRef.current.x * PARALLAX_FACTOR;
      const my = mouseRef.current.y * PARALLAX_FACTOR;
      const now = performance.now();

      ctx.clearRect(0, 0, w, h);

      /* ─── background stars ─── */
      const stars = starsRef.current;
      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        if (!reduced) star.z -= SPEED;
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
        const twinkle = reduced ? 1 : 0.6 + 0.4 * Math.sin(star.twinklePhase + now * star.twinkleSpeed);
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

      /* ─── meteors ─── */
      if (!reduced) {
        const meteors = meteorsRef.current;
        const dt = Math.min(32, now - lastTimeRef.current);
        lastTimeRef.current = now;

        for (let i = meteors.length - 1; i >= 0; i--) {
          const m = meteors[i];
          const cfg = METEOR_STYLES[m.style];
          m.age += dt;

          if (m.age >= m.lifetime) {
            meteors.splice(i, 1);
            continue;
          }

          // Advance position
          m.x += m.dx;
          m.y += m.dy;

          const progress = m.age / m.lifetime;
          const fadeOut = 1 - progress;
          const headBright = fadeOut;

          // ─── spawn fragments (violet-comet only) ───
          if (cfg.fragments && Math.random() < 0.15) {
            m.fragments.push({
              x: m.x - m.dx * (cfg.tailLength / cfg.speed) * 0.6,
              y: m.y - m.dy * (cfg.tailLength / cfg.speed) * 0.6,
              dx: (Math.random() - 0.5) * 2,
              dy: (Math.random() - 0.5) * 2,
              life: 1,
              decay: 0.02 + Math.random() * 0.03,
              size: 1 + Math.random() * 2,
            });
          }

          // ─── draw trail ───
          for (let t = cfg.tailDots; t >= 0; t--) {
            const frac = t / cfg.tailDots;
            const tx = m.x - m.dx * frac * (cfg.tailLength / cfg.speed);
            const ty = m.y - m.dy * frac * (cfg.tailLength / cfg.speed);
            const trailAlpha = headBright * (1 - frac) * 0.7;
            if (trailAlpha < 0.01) continue;
            const radius = Math.max(0.5, 1.5 * (1 - frac * 0.7));
            ctx.beginPath();
            ctx.arc(tx, ty, radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${cfg.color.r}, ${cfg.color.g}, ${cfg.color.b}, ${trailAlpha})`;
            ctx.fill();
          }

          // ─── draw fragments (violet-comet only) ───
          for (let f = m.fragments.length - 1; f >= 0; f--) {
            const frag = m.fragments[f];
            frag.x += frag.dx;
            frag.y += frag.dy;
            frag.life -= frag.decay;
            if (frag.life <= 0) {
              m.fragments.splice(f, 1);
              continue;
            }
            ctx.beginPath();
            ctx.arc(frag.x, frag.y, frag.size * frag.life, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${cfg.color.r}, ${cfg.color.g}, ${cfg.color.b}, ${frag.life * 0.5})`;
            ctx.fill();
          }

          // ─── head glow ───
          ctx.beginPath();
          ctx.arc(m.x, m.y, cfg.headGlowRadius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${cfg.color.r}, ${cfg.color.g}, ${cfg.color.b}, ${headBright * 0.3})`;
          ctx.fill();

          // ─── bright head core ───
          ctx.beginPath();
          ctx.arc(m.x, m.y, cfg.headCoreRadius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${cfg.headCore.r}, ${cfg.headCore.g}, ${cfg.headCore.b}, ${headBright * 0.9})`;
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
        position: fixed ? 'fixed' : 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
}
