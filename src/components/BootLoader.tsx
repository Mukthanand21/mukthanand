import { useState, useEffect, useRef, useCallback } from 'react';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

/* ═══════════════════════════════════════════════════════
   Letter → Language mapping (LOCKED — see spec)
   ═══════════════════════════════════════════════════════ */
interface LetterMap {
  en: string;
  script: string;
  lang: string;
  font: string;
}

const LETTERS: LetterMap[] = [
  { en: 'M', script: 'మ', lang: 'Telugu',    font: "'Noto Sans Telugu',sans-serif" },
  { en: 'U', script: 'उ', lang: 'Hindi',     font: "'Noto Sans Devanagari',sans-serif" },
  { en: 'K', script: 'க', lang: 'Tamil',     font: "'Noto Sans Tamil',sans-serif" },
  { en: 'T', script: 'ತ', lang: 'Kannada',   font: "'Noto Sans Kannada',sans-serif" },
  { en: 'H', script: 'হ', lang: 'Bengali',   font: "'Noto Sans Bengali',sans-serif" },
  { en: 'A', script: 'അ', lang: 'Malayalam', font: "'Noto Sans Malayalam',sans-serif" },
  { en: 'N', script: 'न', lang: 'Marathi',   font: "'Noto Sans Devanagari',sans-serif" },
  { en: 'A', script: 'અ', lang: 'Gujarati',  font: "'Noto Sans Gujarati',sans-serif" },
  { en: 'N', script: 'ਨ', lang: 'Punjabi',   font: "'Noto Sans Gurmukhi',sans-serif" },
  { en: 'D', script: 'ଡ', lang: 'Odia',      font: "'Noto Sans Oriya',sans-serif" },
];

/* ═══════════════════════════════════════════════════════
   Scramble character pool — all Indian script chars
   ═══════════════════════════════════════════════════════ */
const SCRAMBLE_POOL = [
  'మ','న','క','ర','ఉ','అ','ల','వ','త','హ',
  'त','न','क','र','ह','उ','म',
  'ம','ந','க','ர','ல','வ','த',
  'ಮ','ನ','ಕ','ರ','ಲ','ವ','ತ','ಹ',
  'ম','ন','ক','র','ল','ভ',
  'അ','ന','ക','ര','ല','വ',
  'न','म','क','र','ह',
  'અ','ન','ક','ર','લ',
  'ਨ','ਮ','ਕ','ਰ','ਲ',
  'ଡ','ନ','କ','ର','ଲ',
];

type BootPhase = 'boot' | 'active' | 'complete';

type BootLoaderProps = {
  onComplete?: () => void;
};

/* ═══════════════════════════════════════════════════════
   BootLoader v3 — 7-stage script scramble sequence
   ═══════════════════════════════════════════════════════ */
export function BootLoader({ onComplete }: BootLoaderProps) {
  const reduced = usePrefersReducedMotion();

  /* ─── UI state ─── */
  const [phase, setPhase] = useState<BootPhase>('boot');
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [typedChars, setTypedChars] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [langLabel, setLangLabel] = useState('');
  const [showSystem, setShowSystem] = useState(false);
  const [underlineWidth, setUnderlineWidth] = useState('0px');
  const [showGoldFlash, setShowGoldFlash] = useState(false);

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

  /* ─── Language label helper ─── */
  const showLang = useCallback((txt: string) => {
    setLangLabel('');
    T(() => { setLangLabel(txt); }, 10);
    T(() => { setLangLabel(''); }, 610);
  }, [T]);

  /* ─── Typewriter for SYSTEM READY ─── */
  const typeSystemReady = useCallback((text: string, onDone: () => void) => {
    setTypedChars(0);
    typedCharsRef.current = 0;
    setIsTyping(true);
    const interval = window.setInterval(() => {
      typedCharsRef.current++;
      setTypedChars(typedCharsRef.current);
      if (typedCharsRef.current >= text.length) {
        clearInterval(interval);
        setIsTyping(false);
        T(onDone, 250);
      }
    }, 55);
    timersRef.current.push(interval);
  }, [T]);

  /* ─── Letter scramble (per letter) ─── */
  const scrambleLetter = useCallback((index: number, onLock: () => void) => {
    const letter = LETTERS[index];
    const span = letterRefs.current[index];
    if (!span) { onLock(); return; }

    let count = 0;
    const totalCycles = 10;

    const cycle = () => {
      if (skipRef.current) return;
      if (count < totalCycles) {
        const randomChar = SCRAMBLE_POOL[Math.floor(Math.random() * SCRAMBLE_POOL.length)];
        span!.textContent = randomChar;
        span!.style.color = count < 5 ? '#3D2A3D' : '#5A3A6A';
        span!.style.fontFamily = "'Noto Sans Telugu',sans-serif";
        count++;
        T(cycle, 55 + Math.random() * 30);
      } else {
        // LOCK to assigned script
        span!.textContent = letter.script;
        span!.style.fontFamily = letter.font;
        span!.style.color = '#7A5A8A';
        span!.style.textShadow = '0 0 12px rgba(232,182,90,0.25)';
        T(() => {
          if (span) span!.style.textShadow = 'none';
          onLock();
        }, 150);
      }
    };

    cycle();
  }, [T]);

  /* ─── Reveal: flip all letters to English ─── */
  const bigReveal = useCallback(() => {
    // Gold flash
    setShowGoldFlash(true);
    T(() => setShowGoldFlash(false), 80);

    // Flip all letters
    for (let i = 0; i < LETTERS.length; i++) {
      const span = letterRefs.current[i];
      if (!span) continue;
      span.style.transition = 'color 0.5s ease-out, font-family 0.2s, text-shadow 0.5s';
      span.style.fontFamily = "'Syne',sans-serif";
      span.style.color = 'var(--color-text-primary)';
      span.style.textShadow = '0 0 40px rgba(232,182,90,0.5)';
      span.textContent = LETTERS[i].en;
      T(() => {
        if (span) span.style.textShadow = 'none';
      }, 600);
    }
  }, [T]);

  /* ─── Ambient particles (canvas) ─── */
  const startParticles = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let ctx: CanvasRenderingContext2D | null = null;
    try { ctx = canvas.getContext('2d'); } catch { return; }
    if (!ctx) return;

    const accentColor = 'var(--color-accent)';

    // Size canvas to container
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
      r: 0.4 + Math.random() * 0.8,
      op: 0.04 + Math.random() * 0.1,
      vx: (Math.random() - 0.5) * 0.15,
      vy: (Math.random() - 0.5) * 0.15,
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

  /* ─── Keyboard interrupt ─── */
  useEffect(() => {
    if (phase === 'complete') return;

    const handleKeyDown = () => {
      if (skipRef.current) return;
      skipRef.current = true;

      // Clear all timers and rAFs
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
      // Reduced motion: show final state immediately
      setPhase('active');
      // Set letters to English immediately
      T(() => {
        for (let i = 0; i < LETTERS.length; i++) {
          const span = letterRefs.current[i];
          if (!span) continue;
          span.textContent = LETTERS[i].en;
          span.style.fontFamily = "'Syne',sans-serif";
          span.style.color = 'var(--color-text-primary)';
        }
        setShowSystem(true);
        setUnderlineWidth('300px');
        setProgress(100);
        T(() => {
          if (skipRef.current) return;
          onCompleteRef.current?.();
          setPhase('complete');
        }, 200);
      }, 10);
      return;
    }

    /* ── Stage 1: Black flash (80ms) ── */
    // Phase is already 'boot' — black background

    T(() => {
      if (skipRef.current) return;

      /* ── Stage 2: Boot begins (80ms+) ── */
      setPhase('active');
      startParticles();
      setStatusText('INITIALIZING SYSTEM...');
      setProgress(5);

      T(() => {
        if (skipRef.current) return;

        /* ── Stage 3: Identity scan (880ms+) ── */
        setStatusText('SCANNING IDENTITY...');
        setProgress(15);

        // Start letter scramble — stagger 200ms apart
        let lockedCount = 0;

        for (let i = 0; i < LETTERS.length; i++) {
          T(() => {
            if (skipRef.current) return;

            // Show language label
            showLang(LETTERS[i].lang);

            // Scramble this letter
            scrambleLetter(i, () => {
              if (skipRef.current) return;
              lockedCount++;
              setProgress(Math.round(15 + (lockedCount / LETTERS.length) * 55));

              /* ── Stage 5: All locked — anticipation hold ── */
              if (lockedCount === LETTERS.length) {
                setStatusText('RESOLVING...');
                setProgress(80);
                // Force status color via inline style

                // After 300ms: brighten all locked chars
                T(() => {
                  if (skipRef.current) return;
                  for (let j = 0; j < LETTERS.length; j++) {
                    const span = letterRefs.current[j];
                    if (span) {
                      span.style.transition = 'color 0.7s';
                      span.style.color = '#AA7ACC';
                    }
                  }

                  // After 900ms total from RESOLVING: status clears, bar 95%
                  T(() => {
                    if (skipRef.current) return;
                    setStatusText('');
                    setProgress(95);

                    /* ── Stage 6: THE REVEAL (after 1200ms from stage 5 start) ── */
                    T(() => {
                      if (skipRef.current) return;

                      setProgress(100);
                      bigReveal();

                      /* ── Stage 7: System ready (500ms after reveal) ── */
                      T(() => {
                        if (skipRef.current) return;

                        setShowSystem(true);
                        setUnderlineWidth('300px');

                        // After 400ms: type SYSTEM READY
                        T(() => {
                          if (skipRef.current) return;
                          typeSystemReady('SYSTEM READY', () => {
                            if (skipRef.current) return;

                            // Boot complete — call onComplete, then fade out
                            onCompleteRef.current?.();
                            T(() => {
                              if (skipRef.current) return;
                              setPhase('complete');
                            }, 400);
                          });
                        }, 400);
                      }, 500);
                    }, 300);
                  }, 600);
                }, 300);
              }
            });
          }, 200 + i * 200);
        }
      }, 800);
    }, 80);

    return () => {
      timersRef.current.forEach(clearTimeout);
      rafsRef.current.forEach(cancelAnimationFrame);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ─── Render ─── */
  if (phase === 'complete') return null;

  const statusColor = statusText === 'RESOLVING...'
    ? '#8A6A8A'
    : statusText === 'SYSTEM READY'
      ? 'var(--color-accent)'
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

        {/* Main boot content — only visible after stage 1 */}
        {phase === 'active' && (
          <div
            className="relative z-10 flex flex-col items-center"
            style={{ padding: '0 16px' }}
          >
            {/* Language label (above letter row) */}
            <div
              className="font-mono text-[11px] tracking-[0.25em] uppercase text-center"
              style={{
                color: 'var(--color-text-muted)',
                height: '16px',
                marginBottom: '20px',
                opacity: langLabel ? 1 : 0,
                transition: 'opacity 0.1s',
              }}
            >
              {langLabel}
            </div>

            {/* Letter row */}
            <div
              className="flex items-center justify-center"
              style={{
                gap: '2px',
                minHeight: '100px',
              }}
            >
              {LETTERS.map((_, i) => (
                <span
                  key={i}
                  ref={(el) => { letterRefs.current[i] = el; }}
                  style={{
                    fontSize: 'clamp(36px, 6.5vw, 70px)',
                    fontWeight: 700,
                    display: 'inline-block',
                    minWidth: '0.58em',
                    textAlign: 'center',
                    lineHeight: 1.1,
                  }}
                />
              ))}
            </div>

            {/* SYSTEM label (appears after reveal) */}
            {showSystem && (
              <div
                className="font-mono font-medium tracking-[0.4em] text-center"
                style={{
                  fontSize: 'clamp(12px, 2vw, 17px)',
                  color: 'var(--color-accent)',
                  marginTop: '10px',
                  opacity: showSystem ? 1 : 0,
                  transition: 'opacity 0.6s',
                }}
              >
                SYSTEM
              </div>
            )}

            {/* Gold gradient underline */}
            <div
              className={showSystem ? '' : 'invisible'}
              style={{
                height: '1px',
                background: 'linear-gradient(90deg, transparent, var(--color-accent), transparent)',
                width: underlineWidth,
                transition: 'width 1.2s cubic-bezier(0.16,1,0.3,1)',
                margin: showSystem ? '18px auto 14px' : '18px auto 14px',
              }}
            />

            {/* Status line */}
            <div
              className="font-mono text-[11px] tracking-[0.18em] uppercase text-center"
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
                    <span style={{ marginLeft: '2px' }}>{'\u258C'}</span>
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
                    width: '160px',
                    height: '1px',
                    background: '#1E141E',
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

      {/* Gold flash overlay (stage 6) */}
      {showGoldFlash && (
        <div
          className="fixed inset-0 z-[201] pointer-events-none"
          style={{
            background: 'var(--color-accent)',
            opacity: 0.15,
          }}
        />
      )}
    </>
  );
}
