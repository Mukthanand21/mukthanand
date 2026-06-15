import { useState, useEffect, useRef, useCallback } from 'react';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

/* ═══════════════════════════════════════════════════════
   Script data — LOCKED per spec
   ═══════════════════════════════════════════════════════ */
const LETTER_SCRIPTS: Record<string, string[]> = {
  'M': ['మ', 'म', 'ம', 'ಮ', 'ম'],
  'U': ['ఉ', 'उ', 'உ', 'ಉ', 'উ'],
  'K': ['క', 'क', 'க', 'ಕ', 'ক'],
  'T': ['త', 'त', 'த', 'ತ', 'ত'],
  'H': ['హ', 'ह', 'ஹ', 'ಹ', 'হ'],
  'A': ['అ', 'अ', 'அ', 'ಅ', 'অ'],
  'N': ['న', 'न', 'ந', 'ನ', 'ন'],
  'D': ['డ', 'ड', 'ட', 'ಡ', 'ড'],
};

const SCRIPT_FONTS = [
  "'Noto Sans Telugu', sans-serif",
  "'Noto Sans Devanagari', sans-serif",
  "'Noto Sans Tamil', sans-serif",
  "'Noto Sans Kannada', sans-serif",
  "'Noto Sans Bengali', sans-serif",
];

const NAME = 'MUKTHANAND';
const LETTERS = NAME.split('');

/* ═══════════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════════ */
type BootPhase = 'boot' | 'active' | 'complete';

type BootLoaderProps = {
  onComplete?: () => void;
};

/* ═══════════════════════════════════════════════════════
   BootLoader v3 — sequential 5-script cycling
   ═══════════════════════════════════════════════════════ */
export function BootLoader({ onComplete }: BootLoaderProps) {
  const reduced = usePrefersReducedMotion();

  /* ─── UI state ─── */
  const [phase, setPhase] = useState<BootPhase>('boot');
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [typedChars, setTypedChars] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [showGoldLine, setShowGoldLine] = useState(false);

  /* ─── Refs ─── */
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const letterRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const timersRef = useRef<number[]>([]);
  const rafsRef = useRef<number[]>([]);
  const typedCharsRef = useRef(0);
  const skipRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  /* ─── Timer / rAF helpers ─── */
  const T = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timersRef.current.push(id);
    return id;
  }, []);

  const RAF = useCallback((fn: FrameRequestCallback) => {
    const id = requestAnimationFrame(fn);
    rafsRef.current.push(id);
    return id;
  }, []);

  /* ─── cycleLetter: 6 cycles at 40ms each, then lock to English ─── */
  const cycleLetter = useCallback((
    idx: number,
    letter: string,
    onLock: () => void,
  ) => {
    const span = letterRefs.current[idx];
    if (!span) { onLock(); return; }

    const scripts = LETTER_SCRIPTS[letter];
    if (!scripts) { onLock(); return; }

    let iteration = 0;
    const total = 6; // 3 dim + 3 bright

    const step = () => {
      if (skipRef.current) return;

      if (iteration < total) {
        const si = iteration % scripts.length;
        span.textContent = scripts[si];
        span.style.fontFamily = SCRIPT_FONTS[si];
        span.style.color = iteration < 3 ? '#4D3A4D' : '#8A6A8A';
        span.style.transform = 'scale(1)';

        iteration++;
        T(step, 50);
      } else {
        // LOCK to English — gold flash + scale pop
        span.style.transition = 'color 0.15s, font-family 0.08s, transform 0.15s';
        span.style.fontFamily = "'Syne', sans-serif";
        span.style.color = '#E8B65A';
        span.style.transform = 'scale(1.15)';
        span.textContent = letter;

        // After 120ms: settle to white
        T(() => {
          if (skipRef.current) return;
          if (span) {
            span.style.color = 'var(--color-text-primary)';
            span.style.transform = 'scale(1)';
          }
          onLock();
        }, 180);
      }
    };

    step();
  }, [T]);

  /* ─── typeIn: type text char by char with cursor ─── */
  const typeIn = useCallback((text: string, onDone: () => void) => {
    setStatusText(text);
    setTypedChars(0);
    typedCharsRef.current = 0;
    setIsTyping(true);
    const interval = window.setInterval(() => {
      typedCharsRef.current++;
      setTypedChars(typedCharsRef.current);
      if (typedCharsRef.current >= text.length) {
        clearInterval(interval);
        setIsTyping(false);
        T(onDone, 150);
      }
    }, 33);
    timersRef.current.push(interval);
  }, [T]);

  /* ─── Ambient particles (canvas) ─── */
  const startParticles = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let ctx: CanvasRenderingContext2D | null = null;
    try { ctx = canvas.getContext('2d'); } catch { return; }
    if (!ctx) return;

    // Resolve the accent color — CSS vars don't work in Canvas 2D context
    const accentColor = getComputedStyle(document.documentElement)
      .getPropertyValue('--color-accent').trim() || '#E8B65A';

    const resize = () => {
      if (!canvas || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };
    resize();

    const pts = Array.from({ length: 14 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: 0.5 + Math.random() * 1.0,
      op: 0.05 + Math.random() * 0.15,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
    }));

    const draw = () => {
      if (skipRef.current) return;
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of pts) {
        p.x = (p.x + p.vx + canvas.width) % canvas.width;
        p.y = (p.y + p.vy + canvas.height) % canvas.height;
        ctx.globalAlpha = p.op;
        ctx.fillStyle = accentColor;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      RAF(draw);
    };

    RAF(draw);
  }, [RAF]);

  /* ─── Hybrid cascade letter cycling ─── */
  const startLetterCycling = useCallback(() => {
    setStatusText('RESOLVING IDENTITY...');
    setProgress(35);

    let lockedCount = 0;

    for (let i = 0; i < LETTERS.length; i++) {
      // First 3 letters: 0ms, 150ms, 300ms — each subsequent: 250ms after previous begins
      const offset = i < 3 ? i * 150 : 300 + (i - 2) * 250;

      T(() => {
        if (skipRef.current) return;

        cycleLetter(i, LETTERS[i], () => {
          if (skipRef.current) return;
          lockedCount++;

          // Progress + status nudges
          setProgress(35 + Math.floor((lockedCount / LETTERS.length) * 65));
          if (lockedCount === 3) setStatusText('VERIFYING...');
          else if (lockedCount === 6) setStatusText('CALIBRATING...');
          else if (lockedCount === 8) setStatusText('FINALIZING...');

          // All letters locked — gold line + SYSTEM READY
          if (lockedCount === LETTERS.length) {
            setProgress(100);
            T(() => {
              if (skipRef.current) return;
              setShowGoldLine(true);

              T(() => {
                if (skipRef.current) return;
                typeIn('SYSTEM READY', () => {
                  if (skipRef.current) return;
                  onCompleteRef.current?.();
                  T(() => {
                    if (skipRef.current) return;
                    setPhase('complete');
                  }, 400);
                });
              }, 300);
            }, 36);
          }
        });
      }, offset);
    }
  }, [T, cycleLetter, typeIn]);

  /* ─── Keyboard interrupt ─── */
  useEffect(() => {
    if (phase === 'complete') return;

    const handleKeyDown = () => {
      if (skipRef.current) return;
      skipRef.current = true;
      timersRef.current.forEach(clearTimeout);
      rafsRef.current.forEach(cancelAnimationFrame);
      timersRef.current = [];
      rafsRef.current = [];
      onCompleteRef.current?.();
      setPhase('complete');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase]);

  /* ─── Main boot sequence ─── */
  useEffect(() => {
    if (reduced) {
      setPhase('active');
      T(() => {
        for (let i = 0; i < LETTERS.length; i++) {
          const span = letterRefs.current[i];
          if (!span) continue;
          span.textContent = LETTERS[i];
          span.style.fontFamily = "'Syne', sans-serif";
          span.style.color = 'var(--color-text-primary)';
        }
        setShowGoldLine(true);
        setProgress(100);
        setStatusText('SYSTEM READY');
        T(() => {
          if (skipRef.current) return;
          onCompleteRef.current?.();
          setPhase('complete');
        }, 120);
      }, 10);
      return;
    }

    /* Stage 1: Black flash (48ms) */
    T(() => {
      if (skipRef.current) return;

      /* Stage 2: System boot (48ms) */
      setPhase('active');
      startParticles();
      setStatusText('INITIALIZING...');
      setProgress(8);

      T(() => {
        if (skipRef.current) return;

        /* Stage 3: Asset loading (360ms) */
        setStatusText('LOADING ASSETS...');
        setProgress(20);

        T(() => {
          if (skipRef.current) return;

          /* Stage 4: Identity resolution (240ms) */
          setStatusText('RESOLVING IDENTITY...');
          setProgress(35);

          /* Stage 5: Hybrid cascade letter cycling */
          startLetterCycling();
        }, 240);
      }, 360);
    }, 48);

    return () => {
      timersRef.current.forEach(clearTimeout);
      rafsRef.current.forEach(cancelAnimationFrame);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ─── Render ─── */
  if (phase === 'complete') return null;

  const statusColor =
    statusText === 'SYSTEM READY'
      ? 'var(--color-accent)'
      : statusText === 'RESOLVING IDENTITY...'
        ? 'var(--color-text-secondary)'
        : 'var(--color-text-muted)';

  return (
    <>
      {/* Full-screen boot overlay */}
      <div
        ref={containerRef}
        className="fixed inset-0 z-[200] flex flex-col items-center justify-center"
        style={{
          backgroundColor: phase === 'boot' ? '#000' : 'var(--color-bg)',
        }}
      >
        {/* Canvas for ambient particles */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full pointer-events-none"
        />

        {/* Main boot content */}
        {phase === 'active' && (
          <div
            className="relative z-10 flex flex-col items-center"
            style={{ padding: '0 16px' }}
          >
            {/* Letter row */}
            <div
              className="flex items-center justify-center"
              style={{ gap: '2px', minHeight: '100px' }}
            >
              {LETTERS.map((letter, i) => (
                <span
                  key={i}
                  ref={(el) => { letterRefs.current[i] = el; }}
                  style={{
                    fontSize: 'clamp(28px, 7.5vw, 68px)',
                    fontWeight: 800,
                    display: 'inline-block',
                    minWidth: '0.6em',
                    textAlign: 'center',
                    lineHeight: 1.1,
                    transition: 'color 0.15s, font-family 0.08s, transform 0.15s',
                    color: '#3D2A3D',
                    fontFamily: "'Syne', sans-serif",
                  }}
                >
                  {letter}
                </span>
              ))}
            </div>

            {/* Gold gradient underline */}
            <div
              style={{
                height: '2px',
                background: 'linear-gradient(90deg, transparent, var(--color-accent), transparent)',
                width: showGoldLine ? 'min(320px, 80vw)' : '0px',
                transition: 'width 0.6s cubic-bezier(0.16,1,0.3,1)',
                margin: '18px auto 14px',
              }}
            />

            {/* Status line */}
            <div
              className="font-mono text-[11px] tracking-[0.15em] uppercase text-center"
              style={{
                color: statusColor,
                height: '18px',
                transition: 'color 0.25s',
              }}
            >
              {isTyping || typedChars > 0 ? (
                <>
                  <span>{statusText.slice(0, typedChars)}</span>
                  {isTyping && (
                    <span style={{ marginLeft: '2px' }}>{'\u2588'}</span>
                  )}
                </>
              ) : (
                statusText
              )}
            </div>

            {/* Progress bar */}
            {progress > 0 && (
              <>
                <div
                  style={{
                    width: '180px',
                    height: '1px',
                    background: '#2A1F2A',
                    marginTop: '14px',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      height: '100%',
                      width: `${progress}%`,
                      background: 'var(--color-accent)',
                      transition: 'width 0.4s ease-out',
                    }}
                  />
                </div>
                <div
                  className="font-mono text-[10px]"
                  style={{
                    color: progress >= 100 ? 'var(--color-accent)' : '#3D2A3D',
                    marginTop: '6px',
                  }}
                >
                  {progress}%
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}
