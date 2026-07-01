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
  'A': ['అ', 'अ', 'அ', 'அ', 'অ'],
  'N': ['న', 'न', 'ந', 'ನ', 'ন'],
  'D': ['డ', 'ड', 'ட', 'ಡ', 'ड'],
};

// Elegant Traditional Serif scripts for visual texture
const SCRIPT_FONTS = [
  "'Noto Serif Telugu', serif",
  "'Noto Serif Devanagari', serif",
  "'Noto Serif Tamil', serif",
  "'Noto Serif Kannada', serif",
  "'Noto Serif Bengali', serif",
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
   BootLoader — V5.5 Ultimate Ultra-Premium Sequence
   Features:
   1. Circular Iris Reveal Shutter (Collapsing portal exit)
   2. Vignette Masking + Breathing (Atmospheric depth focus)
   3. Letter Lock Spring + Chromatic Aberration Glitch
   4. Power-On Circuit Charge (Pre-scramble shimmer ripple)
   5. Merged Underline Glow Pulse (Breathing circuit activation)
   6. Active Spotlight drifting glow tracking the scramble
   7. Snappy Typewriter SYSTEM READY with blinking block cursor
   8. Fully resolved high-contrast footer HUD text
   9. Syncopate lock-on font to match the landing page Hero name
   10. Traditional Noto Serif scripts for scrambled visual texture
   11. Spaced tracking/gaps for gallery-style typography layout
   12. Collapsing Shutter-Edge Ring (Gold portal ring in sync with shutter)
   13. Bespoke Node Metadata (Tiny geographic location coordinates)
   ═══════════════════════════════════════════════════════ */
export function BootLoader({ onComplete }: BootLoaderProps) {
  const reduced = usePrefersReducedMotion();

  /* ─── UI state ─── */
  const [phase, setPhase] = useState<BootPhase>('boot');
  const [showGoldLine, setShowGoldLine] = useState(false);
  const [systemReady, setSystemReady] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);
  const [glowIntensity, setGlowIntensity] = useState<'faint' | 'bloom' | 'fading'>('faint');
  const [bootStatus, setBootStatus] = useState<'booting' | 'ready'>('booting');
  const [statusText, setStatusText] = useState('');

  /* ─── Segmented Underline Progress Trackers ─── */
  const [lockedStates, setLockedStates] = useState<boolean[]>(new Array(LETTERS.length).fill(false));
  const [cyclingStates, setCyclingStates] = useState<boolean[]>(new Array(LETTERS.length).fill(false));
  const [isPoweringOn, setIsPoweringOn] = useState(false);

  /* ─── Spotlight Glow Tracker ─── */
  const [activeSpotlightIndex, setActiveSpotlightIndex] = useState(-1);
  const [glowPosition, setGlowPosition] = useState({ x: '50%', y: '50%' });

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

  /* ─── Track active letter position for radial glow spotlight ─── */
  useEffect(() => {
    if (showGoldLine) {
      setGlowPosition({ x: '50%', y: '50%' });
      return;
    }

    if (activeSpotlightIndex === -1) {
      setGlowPosition({ x: '50%', y: '50%' });
      return;
    }

    const activeSpan = letterRefs.current[activeSpotlightIndex];
    const container = containerRef.current;
    if (activeSpan && container) {
      const spanRect = activeSpan.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      const x = spanRect.left + spanRect.width / 2 - containerRect.left;
      const y = spanRect.top + spanRect.height / 2 - containerRect.top;
      setGlowPosition({ x: `${x}px`, y: `${y}px` });
    }
  }, [activeSpotlightIndex, showGoldLine]);

  /* ─── Typewriter logic: 30ms/char + snappy 150ms blink ─── */
  const typeIn = useCallback((
    text: string,
    onChar: (curr: string) => void,
    done: () => void
  ) => {
    let index = 0;
    let currentText = '';

    const step = () => {
      if (skipRef.current) return;
      if (index < text.length) {
        currentText += text[index];
        onChar(currentText + '█');
        index++;
        T(step, 30);
      } else {
        // Snappy blinking block cursor
        let blinkCount = 0;
        const blink = () => {
          if (skipRef.current) return;
          if (blinkCount < 2) {
            onChar(text + (blinkCount % 2 === 0 ? ' ' : '█'));
            blinkCount++;
            T(blink, 150);
          } else {
            onChar(text);
            done();
          }
        };
        blink();
      }
    };
    step();
  }, [T]);

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
        // LOCK to English — trigger spring + chromatic glitch keyframe animation on Syncopate
        span.style.fontFamily = "'Syncopate', sans-serif";
        span.textContent = letter;
        span.style.animation = 'letterLock 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards';

        T(() => {
          if (skipRef.current) return;
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
      const offset = i < 3 ? i * 120 : 240 + (i - 2) * 200;

      T(() => {
        if (skipRef.current) return;

        // Track active letter index to update spotlight position
        setActiveSpotlightIndex(i);
        setCyclingStates(prev => {
          const next = [...prev];
          next[i] = true;
          return next;
        });

        cycleLetter(i, LETTERS[i], () => {
          if (skipRef.current) return;

          setCyclingStates(prev => {
            const next = [...prev];
            next[i] = false;
            return next;
          });
          setLockedStates(prev => {
            const next = [...prev];
            next[i] = true;
            return next;
          });

          lockedCount++;

          // All letters locked — gold line sweeps in (merging transition starts)
          if (lockedCount === LETTERS.length) {
            T(() => {
              if (skipRef.current) return;
              setShowGoldLine(true);

              // After gold line starts sweeping — bloom the glow
              T(() => {
                if (skipRef.current) return;
                setGlowIntensity('bloom');
              }, 120);

              // Typewriter SYSTEM READY reveal (360ms typing + 300ms blinking)
              T(() => {
                if (skipRef.current) return;
                setSystemReady(true);
                setBootStatus('ready');

                typeIn('SYSTEM READY', (curr) => {
                  setStatusText(curr);
                }, () => {
                  // Hold the glow for 150ms, then reveal the main page
                  T(() => {
                    if (skipRef.current) return;
                    setGlowIntensity('fading');
                    T(() => {
                      if (skipRef.current) return;
                      onCompleteRef.current?.();
                      setIsRevealing(true);
                      T(() => {
                        if (skipRef.current) return;
                        setPhase('complete');
                      }, 1200);
                    }, 50);
                  }, 150);
                });
              }, 100);
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
      timersRef.current = [];
      
      setLockedStates(new Array(LETTERS.length).fill(true));
      setCyclingStates(new Array(LETTERS.length).fill(false));
      
      onCompleteRef.current?.();
      setIsRevealing(true);
      T(() => setPhase('complete'), 1200);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, T]);

  /* ─── Main boot sequence ─── */
  useEffect(() => {
    if (reduced) {
      // Quick reveal: show name immediately, fade in
      T(() => {
        setLockedStates(new Array(LETTERS.length).fill(true));
        for (let i = 0; i < LETTERS.length; i++) {
          const span = letterRefs.current[i];
          if (!span) continue;
          span.textContent = LETTERS[i];
          span.style.fontFamily = "'Syncopate', sans-serif";
          span.style.color = 'var(--color-text-primary)';
        }
        setShowGoldLine(true);
        T(() => {
          if (skipRef.current) return;
          setSystemReady(true);
          setStatusText('SYSTEM READY');
          T(() => {
            if (skipRef.current) return;
            onCompleteRef.current?.();
            setPhase('complete');
          }, 400);
        }, 200);
      }, 10);
      return;
    }

    /* Stage 1: Black void (250ms) ─── */
    T(() => {
      if (skipRef.current) return;

      /* Stage 2: Power-on charge ripple starts */
      setPhase('active');
      setIsPoweringOn(true);

      // Start letter cycling after the 400ms ripple finishes
      T(() => {
        if (skipRef.current) return;
        setIsPoweringOn(false);
        startLetterCycling();
      }, 400);
    }, 250);

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
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden"
      style={{
        backgroundColor: phase === 'boot' ? '#000' : 'var(--color-bg)',
        transition: 'background-color 0.3s ease-out',
        // Circular Iris Reveal Shutter (Collapsing circular portal)
        clipPath: isRevealing ? 'circle(0% at 50% 50%)' : 'circle(150% at 50% 50%)',
        transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
        transitionDuration: isRevealing ? '1.2s' : '0s',
        transitionProperty: 'clip-path, background-color',
      }}
    >
      {/* ─── Collapsing Shutter-Edge Ring (Gold energy portal ring) ─── */}
      {isRevealing && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            borderRadius: '50%',
            border: '2px solid var(--color-accent)',
            boxShadow: '0 0 24px rgba(245, 208, 112, 0.65), inset 0 0 24px rgba(245, 208, 112, 0.45)',
            animation: 'irisCollapse 1.2s cubic-bezier(0.22, 1, 0.36, 1) forwards',
            pointerEvents: 'none',
            zIndex: 10,
          }}
        />
      )}

      {/* ─── CRT Scanline Overlay Texture (Faint Glass Screen Effect) ─── */}
      <div
        className="pointer-events-none absolute inset-0 z-[4]"
        style={{
          background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.15) 50%)',
          backgroundSize: '100% 4px',
          opacity: 0.12,
        }}
        aria-hidden="true"
      />

      {/* ─── Cinematic Vignette Gradient Overlay with Breathing ─── */}
      <div
        className="pointer-events-none absolute inset-0 z-[3]"
        style={{
          background: 'radial-gradient(circle, rgba(0,0,0,0) 30%, rgba(0,0,0,0.85) 100%)',
          animation: 'vignetteBreathe 4s ease-in-out infinite',
        }}
        aria-hidden="true"
      />

      {/* ─── Grain texture overlay ─── */}
      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          opacity: 0.035,
          backgroundImage: `url("${GRAIN_SVG}")`,
        }}
        aria-hidden="true"
      />

      {/* ─── Radial glow spotlight ─── */}
      {(phase === 'active' || phase === 'boot') && (
        <div
          className="pointer-events-none absolute z-[2]"
          style={{
            top: glowPosition.y,
            left: glowPosition.x,
            width: 'min(70vw, 600px)',
            height: 'min(70vw, 600px)',
            transform: 'translate(-50%, -50%)',
            background: 'radial-gradient(circle, rgba(232,182,90,0.22) 0%, rgba(232,182,90,0.06) 45%, transparent 70%)',
            opacity:
              glowIntensity === 'bloom' ? 1.0 :
              glowIntensity === 'fading' ? 0 :
              0.45,
            transition: 'opacity 0.8s cubic-bezier(0.16,1,0.3,1), left 0.6s cubic-bezier(0.16,1,0.3,1), top 0.6s cubic-bezier(0.16,1,0.3,1)',
            willChange: 'opacity, left, top',
          }}
          aria-hidden="true"
        />
      )}

      {phase === 'active' && (
        <div
          className="relative z-10 flex flex-col items-center"
          style={{
            padding: '0 16px',
            // Camera Zoom-Out on exit shutter collapse
            transform: isRevealing ? 'scale(0.93)' : 'scale(1)',
            transition: 'transform 1.2s cubic-bezier(0.22, 1, 0.36, 1)',
            willChange: 'transform',
          }}
        >
          {/* Letter row */}
          <div
            className="flex items-center justify-center"
            style={{
              gap: 'clamp(4px, 1vw, 10px)', // Elegant wider tracking
              minHeight: '100px',
              position: 'relative',
              zIndex: 2,
            }}
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
                  color: '#3D2A3D',
                  fontFamily: "'Syncopate', sans-serif",
                }}
              >
                {letter}
              </span>
            ))}
          </div>

          {/* Segmented-to-continuous Underline / Progress Line */}
          <div
            style={{
              display: 'flex',
              gap: showGoldLine ? '0px' : '6px',
              justifyContent: 'center',
              margin: '22px auto 14px',
              width: showGoldLine ? 'min(280px, 70vw)' : 'min(320px, 80vw)',
              position: 'relative',
              overflow: 'hidden',
              animation: showGoldLine ? 'linePulse 2s ease-in-out infinite' : 'none',
              transition: 'gap 0.5s cubic-bezier(0.16, 1, 0.3, 1), width 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {LETTERS.map((_, i) => {
              const isLocked = lockedStates[i];
              const isCycling = cyclingStates[i];

              let color = '#2A1F2A';
              let anim = 'none';
              let delay = '0s';
              let scaleY = 1;

              if (isPoweringOn) {
                // Power-On circuit charge ripple
                anim = 'powerOnCharge 0.2s ease-out';
                delay = `${i * 20}ms`;
              } else if (isLocked) {
                color = 'var(--color-accent)';
                anim = 'tickFlash 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards';
              } else if (isCycling) {
                color = '#8A6A8A';
                scaleY = 1.4;
              }

              return (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height: '2px',
                    backgroundColor: color,
                    transform: `scaleY(${scaleY})`,
                    animation: anim,
                    animationDelay: delay,
                    transition: 'background 0.3s ease-out, transform 0.2s ease-out',
                  }}
                />
              );
            })}

            {/* Laser Sweep Overlay once fused */}
            {showGoldLine && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  height: '100%',
                  width: '100%',
                  background: 'linear-gradient(90deg, transparent, #FFF, transparent)',
                  backgroundSize: '20% 100%',
                  backgroundRepeat: 'no-repeat',
                  animation: 'laserSweep 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                }}
              />
            )}
          </div>

          {/* SYSTEM READY — Typewriter animation */}
          <div
            style={{
              opacity: systemReady ? 1 : 0,
              color: 'var(--color-accent)',
              fontFamily: 'JetBrains Mono, ui-monospace, monospace',
              fontWeight: 500,
              fontSize: '11px',
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              height: '18px',
              marginTop: '4px',
              textAlign: 'center',
            }}
          >
            {statusText}
          </div>

          {/* Bespoke Node Metadata — Geographic Location coordinates (HYD, IN) */}
          <div
            style={{
              opacity: systemReady ? 0.35 : 0,
              transition: 'opacity 0.6s ease-out',
              color: 'var(--color-text-secondary)',
              fontFamily: 'JetBrains Mono, ui-monospace, monospace',
              fontSize: '9px',
              letterSpacing: '0.15em',
              marginTop: '8px',
              textAlign: 'center',
            }}
          >
            [ BUILD: v3.0.0-GRADUATION // NODE: HYD ]
          </div>
        </div>
      )}

      {/* ─── System status bar — high contrast, clearly visible ─── */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 z-20 flex items-center justify-between"
        style={{
          opacity: isRevealing ? 0 : 1,
          transition: 'opacity 0.4s ease-out',
          padding: '20px 24px',
        }}
      >
        {/* Left: status dot + status label */}
        <div className="flex items-center gap-2">
          <span
            className="block rounded-full"
            style={{
              width: 5,
              height: 5,
              background: bootStatus === 'booting' ? '#FFAE33' : 'var(--color-success)',
              animation: bootStatus === 'booting' ? 'bootAmberPulse 2.5s ease-in-out infinite' : 'none',
              transition: 'background 0.4s ease-out',
            }}
          />
          <span
            style={{
              fontFamily: 'JetBrains Mono, ui-monospace, monospace',
              fontSize: 10,
              color: bootStatus === 'booting' ? '#9E9E9B' : 'var(--color-success)',
              fontWeight: 500,
              letterSpacing: '0.04em',
              transition: 'color 0.4s ease-out',
            }}
          >
            {bootStatus === 'booting' ? 'booting...' : 'online'}
          </span>
        </div>

        {/* Right: version tag */}
        <span
          style={{
            fontFamily: 'JetBrains Mono, ui-monospace, monospace',
            fontSize: 10,
            color: '#808080',
            fontWeight: 500,
          }}
        >
          v3.0.0
        </span>
      </div>

      {/* ─── Keyframe Animations ─── */}
      <style>{`
        @keyframes bootAmberPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.35; }
        }

        @keyframes tickFlash {
          0% {
            filter: drop-shadow(0 0 12px rgba(245, 208, 112, 1));
            transform: scaleY(2.5);
            background-color: #FFFFFF;
          }
          100% {
            filter: drop-shadow(0 0 4px rgba(245, 208, 112, 0.6));
            transform: scaleY(1);
            background-color: var(--color-accent);
          }
        }

        @keyframes laserSweep {
          0% {
            background-position: -20% 0;
          }
          100% {
            background-position: 120% 0;
          }
        }

        /* Chromatic Lock Glitch + Elastic Bounce keyframe using Syncopate values */
        @keyframes letterLock {
          0% {
            transform: scale(1.35);
            filter: drop-shadow(0 0 15px rgba(245, 208, 112, 0.8));
            color: #E8B65A;
            text-shadow: 2px 0 rgba(255, 0, 0, 0.6), -2px 0 rgba(0, 255, 255, 0.6);
          }
          30% {
            text-shadow: -1px 0 rgba(255, 0, 0, 0.4), 1px 0 rgba(0, 255, 255, 0.4);
          }
          50% {
            transform: scale(0.92);
            filter: drop-shadow(0 0 3px rgba(245, 208, 112, 0.2));
            text-shadow: none;
          }
          75% {
            transform: scale(1.05);
            filter: drop-shadow(0 0 8px rgba(245, 208, 112, 0.4));
          }
          100% {
            transform: scale(1);
            filter: drop-shadow(0 0 6px rgba(245, 208, 112, 0.15));
            color: var(--color-text-primary);
            text-shadow: none;
          }
        }

        @keyframes linePulse {
          0%, 100% {
            filter: drop-shadow(0 0 4px rgba(245, 208, 112, 0.4));
          }
          50% {
            filter: drop-shadow(0 0 12px rgba(245, 208, 112, 0.95));
          }
        }

        @keyframes powerOnCharge {
          0% {
            background-color: #2A1F2A;
          }
          40% {
            background-color: var(--color-accent);
            filter: drop-shadow(0 0 8px rgba(245, 208, 112, 0.8));
          }
          100% {
            background-color: #2A1F2A;
            filter: none;
          }
        }

        @keyframes vignetteBreathe {
          0%, 100% {
            opacity: 0.8;
          }
          50% {
            opacity: 0.92;
          }
        }

        /* Collapsing shutter-edge energy ring animation */
        @keyframes irisCollapse {
          0% {
            width: 250vmax;
            height: 250vmax;
            opacity: 0.85;
          }
          100% {
            width: 0px;
            height: 0px;
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
