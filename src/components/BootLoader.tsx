import { useState, useEffect, useRef, useCallback } from 'react';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

/* ─── status lines for boot stage 2 ─── */
const BOOT_STATUSES = [
  'LOADING ASSETS...',
  'MOUNTING ROUTES...',
  'RESOLVING STACK...',
  'SYSTEM READY',
] as const;

/* ─── progress steps (non-linear) ─── */
const PROGRESS_STEPS = [12, 38, 71, 100] as const;

/* ─── typewriter speed (ms per character) ─── */
const TYPING_SPEED = 15;



type BootPhase = 'boot' | 'stage1' | 'stage2' | 'stage3' | 'stage4' | 'complete';

type BootLoaderProps = {
  onComplete?: () => void;
};

/* ============================================================
   3D wireframe cube helpers
   ============================================================ */
type Vec3 = [number, number, number];

const CUBE_VERTS: Vec3[] = [
  [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
  [-1, -1,  1], [1, -1,  1], [1, 1,  1], [-1, 1,  1],
];

const CUBE_EDGES: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 0],
  [4, 5], [5, 6], [6, 7], [7, 4],
  [0, 4], [1, 5], [2, 6], [3, 7],
];

function rotateY(p: Vec3, angle: number): Vec3 {
  const c = Math.cos(angle), s = Math.sin(angle);
  return [p[0] * c + p[2] * s, p[1], -p[0] * s + p[2] * c];
}

function rotateX(p: Vec3, angle: number): Vec3 {
  const c = Math.cos(angle), s = Math.sin(angle);
  return [p[0], p[1] * c - p[2] * s, p[1] * s + p[2] * c];
}

function project(p: Vec3, cx: number, cy: number, scale: number): [number, number] {
  const d = 3;
  const factor = d / (d + p[2]);
  return [cx + p[0] * scale * factor, cy - p[1] * scale * factor];
}

function drawWireframeCube(
  ctx: CanvasRenderingContext2D,
  angleY: number,
  angleX: number,
  cx: number,
  cy: number,
  scale: number,
  color: string,
  glow = true,
) {
  const projected = CUBE_VERTS.map(v => {
    const ry = rotateY(v, angleY);
    const rx = rotateX(ry, angleX);
    return project(rx, cx, cy, scale);
  });

  ctx.strokeStyle = color;
  ctx.lineWidth = 1.2;
  if (glow) {
    ctx.shadowColor = color;
    ctx.shadowBlur = 12;
  }

  for (const [i, j] of CUBE_EDGES) {
    ctx.beginPath();
    ctx.moveTo(projected[i][0], projected[i][1]);
    ctx.lineTo(projected[j][0], projected[j][1]);
    ctx.stroke();
  }

  ctx.shadowBlur = 0;

  // Vertex dots
  for (const [x, y] of projected) {
    ctx.beginPath();
    ctx.arc(x, y, 1.5, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  }
}

/* ============================================================
   BootLoader — 4-stage cinematic entrance sequence
   ============================================================ */
export function BootLoader({ onComplete }: BootLoaderProps) {
  const reduced = usePrefersReducedMotion();
  const hasBooted = typeof window !== 'undefined'
    && sessionStorage.getItem('boot_complete') === 'true';

  const [phase, setPhase] = useState<BootPhase>(() => {
    if (hasBooted) return 'stage4';
    return 'boot';
  });
  const [progressIndex, setProgressIndex] = useState(-1);
  const [statusText, setStatusText] = useState('');
  const [typedChars, setTypedChars] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [showCursor, setShowCursor] = useState(false);
  const [glitching, setGlitching] = useState(false);
  const [showReplay, setShowReplay] = useState(false);
  const [scanPos, setScanPos] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const typeTimerRef = useRef(0);
  const cursorTimerRef = useRef(0);
  const scanRafRef = useRef(0);
  const skipRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  /* ─── typewriter: animate a line char by char ─── */
  const typeText = useCallback((text: string, onDone: () => void) => {
    setTypedChars(0);
    setIsTyping(true);
    setShowCursor(true);
    let i = 0;
    typeTimerRef.current = window.setInterval(() => {
      i++;
      setTypedChars(i);
      if (i >= text.length) {
        clearInterval(typeTimerRef.current);
        setIsTyping(false);
        // blink cursor for a moment after line completes
        cursorTimerRef.current = window.setTimeout(() => {
          setShowCursor(false);
        }, 250);
        onDone();
      }
    }, TYPING_SPEED);
  }, []);

  /* ─── keyboard interrupt: any key skips boot ─── */
  useEffect(() => {
    if (phase === 'complete') return;

    const handleKeyDown = () => {
      if (skipRef.current) return;
      skipRef.current = true;

      clearInterval(typeTimerRef.current);
      clearTimeout(cursorTimerRef.current);
      cancelAnimationFrame(rafRef.current);
      cancelAnimationFrame(scanRafRef.current);

      // mark complete + fire reveal
      sessionStorage.setItem('boot_complete', 'true');
      onCompleteRef.current?.();
      setPhase('complete');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase]);

  /* ─── stage 3: cube rotation → implosion → explosion burst ─── */
  const runStage3Sequence = useCallback(() => {
    let canvas: HTMLCanvasElement | null = null;
    let ctx: CanvasRenderingContext2D | null = null;
    try {
      canvas = canvasRef.current;
      if (!canvas) return;
      ctx = canvas.getContext('2d');
      if (!ctx) return;
    } catch {
      return; // canvas unavailable — skip stage 3 silently
    }

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const baseColor = getComputedStyle(document.documentElement)
      .getPropertyValue('--color-accent').trim() || '#E8B65A';
    const cyanColor = '#22D3EE';
    const violetColor = '#A855F7';

    let angleY = 0;
    let angleX = 0;
    let seqPhase: 'rotate' | 'implode' | 'explode' = 'rotate';
    let seqStart = performance.now();
    const ROTATE_MS = 160;
    const IMPLODE_MS = 60;
    const EXPLODE_MS = 300;

    // Explosion particles
    type ExplodeP = { angle: number; dist: number; speed: number; size: number; hueShift: number; color: string };
    let particles: ExplodeP[] = [];

    const initExplosion = () => {
      const count = 45 + Math.floor(Math.random() * 20);
      particles = [];
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = 80 + Math.random() * 200;
        const size = 1 + Math.random() * 3.5;
        const hueShift = Math.random();
        const colorBucket = Math.random();
        const color =
          colorBucket < 0.5 ? baseColor
            : colorBucket < 0.8 ? cyanColor
              : violetColor;
        particles.push({ angle, dist, speed: 0.6 + Math.random() * 1.0, size, hueShift, color });
      }
    };

    let cleared = false;

    const animate = (now: number) => {
      if (skipRef.current) return;
      const elapsed = now - seqStart;

      // semi-transparent clear for motion trails
      ctx.fillStyle = 'rgba(10, 10, 10, 0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (seqPhase === 'rotate') {
        angleY += 0.035;
        angleX += 0.012;
        drawWireframeCube(ctx, angleY, angleX, cx, cy, 55, baseColor, true);

        if (elapsed >= ROTATE_MS) {
          seqPhase = 'implode';
          seqStart = now;
        }
        rafRef.current = requestAnimationFrame(animate);

      } else if (seqPhase === 'implode') {
        const scale = Math.max(0, 1 - Math.min(elapsed / IMPLODE_MS, 1));
        angleY += 0.04;
        angleX += 0.015;
        drawWireframeCube(ctx, angleY, angleX, cx, cy, 55 * scale, baseColor, true);

        if (elapsed >= IMPLODE_MS) {
          seqPhase = 'explode';
          seqStart = now;
          initExplosion();
          cleared = false;
        }
        rafRef.current = requestAnimationFrame(animate);

      } else if (seqPhase === 'explode') {
        const easeT = 1 - Math.pow(1 - Math.min(elapsed / EXPLODE_MS, 1), 2);

        if (!cleared) {
          // full clear on first explosion frame
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          cleared = true;
        }

        for (const p of particles) {
          const x = cx + Math.cos(p.angle) * p.dist * easeT;
          const y = cy + Math.sin(p.angle) * p.dist * easeT;
          const opacity = Math.max(0, 1 - easeT * 1.1);
          const radius = p.size * (1 - easeT * 0.6);

          ctx.globalAlpha = opacity;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = radius * 3;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;

        if (elapsed >= EXPLODE_MS) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          return;
        }
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
  }, []);

  /* ─── stage 4: scanline reveal mask ─── */
  const runScanlineReveal = useCallback(() => {
    const startTime = performance.now();
    const duration = 450;

    const animate = (now: number) => {
      if (skipRef.current) return;
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      const easeT = 1 - Math.pow(1 - t, 2);
      setScanPos(easeT * 100);

      if (t < 1) {
        scanRafRef.current = requestAnimationFrame(animate);
      } else {
        setScanPos(100);
      }
    };

    scanRafRef.current = requestAnimationFrame(animate);
  }, []);

  /* ─── main boot sequence (runs once on mount) ─── */
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    const isSkipped = reduced || hasBooted;

    if (isSkipped) {
      setPhase('stage4');
      timers.push(setTimeout(() => {
        if (skipRef.current) return;
        setPhase('complete');
        sessionStorage.setItem('boot_complete', 'true');
        onCompleteRef.current?.();
      }, 300));
    } else {
      // Stage 1: Black flash + CRT warm-up scan (80ms)
      setPhase('stage1');

      timers.push(setTimeout(() => {
        if (skipRef.current) return;

        // Stage 2 begins
        setPhase('stage2');

        // Advance through progress steps with typewriter
        let step = 0;

        const advanceStep = () => {
          if (skipRef.current) return;
          setProgressIndex(step);

          const text = BOOT_STATUSES[step];
          setStatusText(text);

          // After SYSTEM READY types out, trigger glitch
          const onTyped = () => {
            if (skipRef.current) return;
            if (step >= PROGRESS_STEPS.length - 1) {
              // SYSTEM READY: glitch, then hold, then stage 3
              setGlitching(true);
              timers.push(setTimeout(() => {
                if (skipRef.current) return;
                setGlitching(false);

                timers.push(setTimeout(() => {
                  if (skipRef.current) return;
                  setPhase('stage3');
                  runStage3Sequence();

                  // After stage 3 → stage 4 scanline reveal
                  timers.push(setTimeout(() => {
                    if (skipRef.current) return;
                    setPhase('stage4');

                    // Content becomes visible NOW under the scanline mask — progressive reveal
                    sessionStorage.setItem('boot_complete', 'true');
                    onCompleteRef.current?.();

                    // Scanline sweep
                    runScanlineReveal();

                    // Keep overlay visible for 1000ms total so content's Framer Motion
                    // entrance animations (nav, hero, cards) have time to render
                    // before the overlay fully disappears.
                    timers.push(setTimeout(() => {
                      if (skipRef.current) return;
                      setPhase('complete');
                      setScanPos(100);
                    }, 1000));
                  }, 600));
                }, 400));
              }, 250));
            } else {
              // Advance to next step after a brief pause
              timers.push(setTimeout(() => {
                if (skipRef.current) return;
                step++;
                advanceStep();
              }, 200));
            }
          };

          typeText(text, onTyped);
        };

        // Start first step immediately
        advanceStep();
      }, 80));
    }

    return () => {
      timers.forEach(clearTimeout);
      cancelAnimationFrame(rafRef.current);
      cancelAnimationFrame(scanRafRef.current);
      clearInterval(typeTimerRef.current);
      clearTimeout(cursorTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Show replay button after 3s of completion
  useEffect(() => {
    if (phase === 'complete') {
      const timer = setTimeout(() => setShowReplay(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  // Don't render anything when complete (except replay btn)
  if (phase === 'complete' && !showReplay) return null;

  /* ─── compute scanline mask for stage 4 ─── */
  const scanlineMask =
    phase === 'stage4'
      ? {
          WebkitMaskImage: `linear-gradient(to bottom,
            transparent 0%,
            transparent ${scanPos}%,
            rgba(232, 182, 90, 0.2) ${scanPos}%,
            rgba(232, 182, 90, 0.1) calc(${scanPos}% + 4px),
            white calc(${scanPos}% + 4px),
            white 100%
          )`,
          maskImage: `linear-gradient(to bottom,
            transparent 0%,
            transparent ${scanPos}%,
            rgba(232, 182, 90, 0.2) ${scanPos}%,
            rgba(232, 182, 90, 0.1) calc(${scanPos}% + 4px),
            white calc(${scanPos}% + 4px),
            white 100%
          )`,
          WebkitMaskSize: '100% 100%',
          maskSize: '100% 100%',
          WebkitMaskRepeat: 'no-repeat',
          maskRepeat: 'no-repeat',
        }
      : {};

  return (
    <>
      {/* CRT scan-line overlay (visible during stages 1-3) */}
      {(phase === 'stage1' || phase === 'stage2' || phase === 'stage3') && (
        <div
          className="pointer-events-none fixed inset-0 z-[201] animate-[crt-flicker_6s_infinite]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(to bottom, transparent 0px, transparent 2px, rgba(255,255,255,0.02) 2px, rgba(255,255,255,0.02) 3px)',
          }}
        />
      )}

      {/* Full-screen boot overlay */}
      <div
        className={`fixed inset-0 z-[200] flex flex-col items-center justify-center transition-all duration-300 ${
          phase === 'stage4' || phase === 'complete'
            ? 'pointer-events-none'
            : 'pointer-events-auto'
        } ${phase === 'complete' ? 'opacity-0' : ''}`}
        style={{
          transition: 'background-color 300ms ease-out, opacity 300ms ease',
          backgroundColor:
            phase === 'boot' || phase === 'stage1'
              ? '#000'
              : 'var(--color-bg)',
          ...scanlineMask,
          opacity: phase === 'stage4' ? 1 : undefined,
        }}
      >
        {/* Stage 1: CRT warm-up scan line */}
        {phase === 'stage1' && (
          <div
            className="absolute left-0 right-0 h-px animate-[crt-warmup_80ms_linear_forwards]"
            style={{
              top: 0,
              background:
                'linear-gradient(90deg, transparent 0%, var(--color-accent-dim) 50%, transparent 100%)',
              opacity: 0.6,
            }}
          />
        )}

        {/* Stage 2: Boot loader content */}
        {phase === 'stage2' && (
          <div className="flex flex-col items-center gap-6">
            {/* MUKTHANAND.DEV with chromatic aberration */}
            <h1
              className="font-mono text-sm uppercase tracking-[0.3em]"
              style={{
                color: 'var(--color-text-muted)',
                textShadow:
                  '-0.5px 0 rgba(255,50,50,0.15), 0.5px 0 rgba(50,100,255,0.15)',
              }}
            >
              MUKTHANAND.DEV
            </h1>

            {/* Progress bar track */}
            <div
              className="relative h-px overflow-hidden rounded-full"
              style={{
                width: '200px',
                backgroundColor: 'var(--color-border)',
              }}
            >
              {/* Progress bar fill */}
              <div
                className="absolute left-0 top-0 h-full rounded-full transition-all duration-[180ms] ease-out"
                style={{
                  width: `${progressIndex >= 0 ? PROGRESS_STEPS[progressIndex] : 0}%`,
                  backgroundColor: 'var(--color-accent)',
                  boxShadow:
                    progressIndex >= 0
                      ? '0 0 6px var(--color-accent-dim)'
                      : 'none',
                }}
              />
            </div>

            {/* Typewriter status line */}
            <p
              className={`font-mono text-xs uppercase tracking-widest transition-all duration-300 ${
                glitching ? 'animate-[glitch-text_300ms_ease-out]' : ''
              }`}
              style={{
                color:
                  statusText === 'SYSTEM READY'
                    ? 'var(--color-accent)'
                    : 'var(--color-text-muted)',
                textShadow:
                  statusText === 'SYSTEM READY' && !glitching
                    ? '0 0 8px var(--color-accent-dim)'
                    : 'none',
              }}
            >
              <span>{statusText.slice(0, typedChars)}</span>
              {(isTyping || showCursor) && (
                <span
                  className="inline-block w-[2px] animate-[cursor-blink_800ms_step-end_infinite]"
                  style={{
                    backgroundColor: 'currentColor',
                    height: '1em',
                    verticalAlign: 'middle',
                    marginLeft: '2px',
                  }}
                />
              )}
            </p>
          </div>
        )}

        {/* Stage 3: Canvas particles (cube + explosion) */}
        {phase === 'stage3' && (
          <canvas
            ref={canvasRef}
            className="absolute inset-0 h-full w-full"
            width={window.innerWidth}
            height={window.innerHeight}
          />
        )}

        {/* Stage 4: accent glow edge for the scanline */}
        {phase === 'stage4' && (
          <div
            className="pointer-events-none absolute left-0 right-0 h-px transition-all duration-[50ms] ease-linear"
            style={{
              top: `${scanPos}%`,
              background:
                'linear-gradient(90deg, transparent 0%, var(--color-accent) 50%, transparent 100%)',
              opacity: Math.max(0, 0.6 - scanPos / 200),
            }}
          />
        )}
      </div>

      {/* Replay button */}
      {showReplay && (
        <button
          type="button"
          onClick={() => {
            sessionStorage.removeItem('boot_complete');
            window.location.reload();
          }}
          className="fixed bottom-6 right-6 z-[201] hidden rounded-full border border-border px-3 py-1.5 font-mono text-xs text-fg-muted transition-colors duration-150 hover:text-accent md:block"
          aria-label="Replay boot sequence"
          title="Replay boot sequence"
        >
          {'\u21BA'} REPLAY
        </button>
      )}
    </>
  );
}
