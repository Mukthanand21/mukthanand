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

/* ─── gap between progress steps in ms ─── */
const STEP_GAPS = [180, 140, 120, 100] as const;

type BootPhase = 'boot' | 'stage1' | 'stage2' | 'stage3' | 'stage4' | 'complete';

type BootLoaderProps = {
  onComplete?: () => void;
};

/* ============================================================
   BootLoader — 4-stage cinematic entrance sequence
   specs-v2/000-overview.md §4.1
   - Stage 1 (0-80ms): Black flash
   - Stage 2 (80-1200ms): MUKTHANAND.DEV + progress bar
   - Stage 3 (1200-1600ms): Particle burst (rAF-driven)
   - Stage 4 (1600ms+): Page reveal
   - sessionStorage skip on revisit
   - prefers-reduced-motion: opacity fade only
   - Replay button after 3s (desktop only)
   ============================================================ */
export function BootLoader({ onComplete }: BootLoaderProps) {
  const reduced = usePrefersReducedMotion();
  const hasBooted = typeof window !== 'undefined' && sessionStorage.getItem('boot_complete') === 'true';

  const [phase, setPhase] = useState<BootPhase>(() => {
    if (hasBooted) return 'stage4';
    return 'boot';
  });

  const [progressIndex, setProgressIndex] = useState(-1);
  const [statusText, setStatusText] = useState('');
  const [showLoader, setShowLoader] = useState(true);
  const [showReplay, setShowReplay] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  /* ─── rAF particle burst ─── */
  const runParticleBurst = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const count = 18 + Math.floor(Math.random() * 7); // 18-24

    // Each particle: angle, speed, x, y, opacity, lifetime
    const particles: {
      x: number; y: number;
      vx: number; vy: number;
      opacity: number;
      life: number; // 0-1, decays
    }[] = [];

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.8;
      const speed = 0.3 + Math.random() * 0.6;
      particles.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        opacity: 0.6,
        life: 1,
      });
    }

    const color = getComputedStyle(document.documentElement)
      .getPropertyValue('--color-accent')
      .trim() || '#E8B65A';

    const startTime = performance.now();
    const duration = 400;

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      // decelerate: ease-out quadratic
      const easeT = 1 - Math.pow(1 - t, 2);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const p of particles) {
        p.x = cx + (p.vx * 120 * easeT);
        p.y = cy + (p.vy * 120 * easeT);
        p.opacity = 0.6 * (1 - easeT);

        ctx.fillStyle = color;
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;

      if (t < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
  }, []);

  /* ─── main boot sequence (runs once on mount) ─── */
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    const isSkipped = reduced || hasBooted;

    if (isSkipped) {
      setPhase('stage4');
      timers.push(setTimeout(() => {
        setPhase('complete');
        setShowLoader(false);
        sessionStorage.setItem('boot_complete', 'true');
        onComplete?.();
      }, 300));
    } else {
      // Stage 1: Black flash for 80ms
      setPhase('stage1');

      timers.push(setTimeout(() => {
        // Stage 2 begins
        setPhase('stage2');
        setShowLoader(true);

        // Advance through progress steps
        let step = 0;

        const advanceStep = () => {
          setProgressIndex(step);
          setStatusText(BOOT_STATUSES[step]);
          step++;

          if (step < PROGRESS_STEPS.length) {
            timers.push(setTimeout(advanceStep, STEP_GAPS[step - 1]));
          } else {
            // Hold SYSTEM READY in gold, then move to stage 3
            timers.push(setTimeout(() => {
              setPhase('stage3');
              setShowLoader(false);
              runParticleBurst();

              // Stage 4: page reveal after particle burst
              timers.push(setTimeout(() => {
                setPhase('stage4');

                // Complete
                timers.push(setTimeout(() => {
                  setPhase('complete');
                  sessionStorage.setItem('boot_complete', 'true');
                  onComplete?.();
                }, 400));
              }, 400));
            }, STEP_GAPS[3] + 580)); // Last gap + SYSTEM READY hold
          }
        };

        // Start first step immediately
        advanceStep();
      }, 80));
    }

    return () => {
      timers.forEach(clearTimeout);
      cancelAnimationFrame(rafRef.current);
    };
    // Intentionally empty deps — runs once on mount only.
    // Timeout chains manage stage transitions internally.
    // In StrictMode: cleanup clears timers from 1st mount,
    // then effect re-runs on remount creating fresh timers.
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

  return (
    <>
      {/* full-screen boot overlay */}
      <div
        className={`fixed inset-0 z-[200] flex flex-col items-center justify-center transition-all duration-300 ${
          phase === 'stage4' || phase === 'complete'
            ? 'pointer-events-none opacity-0'
            : 'pointer-events-auto opacity-100'
        }`}
        style={{
          backgroundColor:
            phase === 'boot' || phase === 'stage1'
              ? '#000'
              : 'var(--color-bg)',
        }}
      >
        {/* Stage 2: Boot loader content */}
        {showLoader && phase === 'stage2' && (
          <div className="flex flex-col items-center gap-6">
            {/* MUKTHANAND.DEV */}
            <h1
              className="font-mono text-sm uppercase tracking-[0.3em]"
              style={{ color: 'var(--color-text-muted)' }}
            >
              MUKTHANAND.DEV
            </h1>

            {/* progress bar track */}
            <div
              className="relative h-px overflow-hidden rounded-full"
              style={{
                width: '200px',
                backgroundColor: 'var(--color-border)',
              }}
            >
              {/* progress bar fill */}
              <div
                className="absolute left-0 top-0 h-full rounded-full"
                style={{
                  width: `${progressIndex >= 0 ? PROGRESS_STEPS[progressIndex] : 0}%`,
                  backgroundColor: 'var(--color-accent)',
                  transition: 'width 180ms ease-out',
                }}
              />
            </div>

            {/* status line */}
            <p
              className="font-mono text-xs uppercase tracking-widest transition-colors duration-300"
              style={{
                color:
                  statusText === 'SYSTEM READY'
                    ? 'var(--color-accent)'
                    : 'var(--color-text-muted)',
              }}
            >
              {statusText}
            </p>
          </div>
        )}

        {/* Stage 3: Canvas particles */}
        {(phase === 'stage3') && (
          <canvas
            ref={canvasRef}
            className="absolute inset-0 h-full w-full"
            width={window.innerWidth}
            height={window.innerHeight}
          />
        )}
      </div>

      {/* replay button */}
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
