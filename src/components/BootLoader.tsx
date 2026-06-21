import { useState, useEffect, useRef, useCallback } from 'react';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

/* ─── Grain texture (same SVG data-uri pattern as the hero section) ─── */
const GRAIN_SVG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E";

/* ═══════════════════════════════════════════════════════
   Script data
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
   BootLoader — V3 Cinematic Title Sequence
   Pure visual: multilingual script cycling → gold lock → glow → fade
   No text, no particles, no progress bar.
   ═══════════════════════════════════════════════════════ */
export function BootLoader({ onComplete }: BootLoaderProps) {
  const reduced = usePrefersReducedMotion();

  /* ─── UI state ─── */
  const [phase, setPhase] = useState<BootPhase>('boot');
  const [showGoldLine, setShowGoldLine] = useState(false);
  const [systemReady, setSystemReady] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);

  /* ─── Refs ─── */
  const containerRef = useRef<HTMLDivElement>(null);
  const letterRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const timersRef = useRef<number[]>([]);
  const skipRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  /* ─── Timer helper ─── */
  const T = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timersRef.current.push(id);
    return id;
  }, []);

  /* ─── cycleLetter: 6 cycles at 40ms, then lock to English ─── */
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

        iteration++;
        T(step, 50);
      } else {
        // LOCK to English — gold flash + scale pop
        span.style.transition = 'color 0.15s, font-family 0.08s, transform 0.15s';
        span.style.fontFamily = "'Syne', sans-serif";
        span.style.color = '#E8B65A';
        span.style.transform = 'scale(1.15)';
        span.textContent = letter;

        // Settle to warm white
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

  /* ─── Hybrid cascade letter cycling ─── */
  const startLetterCycling = useCallback(() => {
    let lockedCount = 0;

    for (let i = 0; i < LETTERS.length; i++) {
      const offset = i < 3 ? i * 150 : 300 + (i - 2) * 250;

      T(() => {
        if (skipRef.current) return;

        cycleLetter(i, LETTERS[i], () => {
          if (skipRef.current) return;
          lockedCount++;

          // All letters locked — gold line sweeps in
          if (lockedCount === LETTERS.length) {
            T(() => {
              if (skipRef.current) return;
              setShowGoldLine(true);

              // After gold line starts sweeping, fade in SYSTEM READY
              T(() => {
                if (skipRef.current) return;
                setSystemReady(true);

                // Hold the glow + SYSTEM READY for 600ms, then reveal
                T(() => {
                  if (skipRef.current) return;
                  onCompleteRef.current?.();
                  setIsRevealing(true);
                  T(() => {
                    if (skipRef.current) return;
                    setPhase('complete');
                  }, 1200);
                }, 600);
              }, 400);
            }, 36);
          }
        });
      }, offset);
    }
  }, [T, cycleLetter]);

  /* ─── Keyboard interrupt ─── */
  useEffect(() => {
    if (phase === 'complete') return;

    const handleKeyDown = () => {
      if (skipRef.current) return;
      skipRef.current = true;
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
      onCompleteRef.current?.();
      setIsRevealing(true);
      T(() => setPhase('complete'), 1200);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase]);

  /* ─── Main boot sequence ─── */
  useEffect(() => {
    if (reduced) {
      // Quick reveal: show name immediately, fade in
      T(() => {
        for (let i = 0; i < LETTERS.length; i++) {
          const span = letterRefs.current[i];
          if (!span) continue;
          span.textContent = LETTERS[i];
          span.style.fontFamily = "'Syne', sans-serif";
          span.style.color = 'var(--color-text-primary)';
        }
        setShowGoldLine(true);
        T(() => {
          if (skipRef.current) return;
          setSystemReady(true);
          T(() => {
            if (skipRef.current) return;
            onCompleteRef.current?.();
            setPhase('complete');
          }, 400);
        }, 200);
      }, 10);
      return;
    }

    /* Stage 1: Black void (300ms) — pure black, silence */
    T(() => {
      if (skipRef.current) return;

      /* Stage 2: Script cycling starts */
      setPhase('active');
      startLetterCycling();
    }, 300);

    return () => {
      timersRef.current.forEach(clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ─── Render ─── */
  if (phase === 'complete') return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center"
      style={{
        backgroundColor: phase === 'boot' ? '#000' : 'var(--color-bg)',
        transition: 'background-color 0.3s ease-out',
        clipPath: isRevealing ? 'inset(0 0 100% 0)' : 'inset(0 0 0 0)',
        transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
        transitionDuration: isRevealing ? '1.2s' : '0s',
        transitionProperty: 'clip-path, background-color',
      }}
    >
      {/* ─── Grain texture overlay — same treatment as the hero section ─── */}
      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          opacity: 0.035,
          backgroundImage: `url("${GRAIN_SVG}")`,
        }}
        aria-hidden="true"
      />

      {phase === 'active' && (
        <div
          className="relative z-10 flex flex-col items-center"
          style={{ padding: '0 16px' }}
        >
          {/* Letter row — the entire show */}
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
              margin: '18px auto 10px',
            }}
          />

          {/* SYSTEM READY — fades in after gold line, elegant, no typewriter */}
          <div
            style={{
              opacity: systemReady ? 1 : 0,
              transition: 'opacity 0.5s ease-out',
              color: 'var(--color-accent)',
              fontFamily: "'Syne', sans-serif",
              fontWeight: 700,
              fontSize: 'clamp(10px, 1.4vw, 14px)',
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              height: '20px',
            }}
          >
            SYSTEM READY
          </div>
        </div>
      )}
    </div>
  );
}
