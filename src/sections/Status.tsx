import { useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { useKineticScroll } from '../motion/useKineticScroll';
import { KineticSwapper } from '../components/KineticSwapper';
import { DimmedPunctuation } from '../components/DimmedPunctuation';

gsap.registerPlugin(ScrollTrigger);

/* ============================================================
   specs-v2/001-status.md — Hero /status
   styled as premium editorial + 3D server rack background.
   ============================================================ */

/* ─── Grain overlay texture ─── */
const GRAIN_SVG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E";

/* ============================================================
   /status section — specs-v2/001-status.md
   Layout:
     - 3D server rack background (RackScene)
     - Vignette + grain overlays
     - Status bar (top)
     - Two-column grid: identity (left) + status sidebar (right)
     - Rack readout (bottom)
     - Ticker
     - Project preview cards
   ============================================================ */
export function Status() {
  const heroRef = useKineticScroll<HTMLHeadingElement>({ maxSkew: 2 });
  const heroAccentRef = useKineticScroll<HTMLHeadingElement>({ maxSkew: 2 });

  const [scrollOpacity, setScrollOpacity] = useState(1);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // delay scroll indicator fade-in until landing title transitions finish
    const timer = setTimeout(() => setVisible(true), 3000);

    const handleScroll = () => {
      const y = window.scrollY;
      const opacity = Math.max(0, 1 - y / 100);
      setScrollOpacity(opacity);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    if (!heroRef.current || !heroAccentRef.current) return;

    // Kinetic kerning: slightly expand letter spacing on scroll
    gsap.to([heroRef.current, heroAccentRef.current], {
      scrollTrigger: {
        trigger: '#status',
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
      letterSpacing: '0.12em',
      ease: 'none',
    });
  }, [heroRef, heroAccentRef]);

  return (
    <section
      id="status"
      className="relative min-h-[85dvh] md:min-h-[100dvh] overflow-hidden pt-6"
      style={{ width: '100vw', marginLeft: 'calc(-50vw + 50%)' }}
    >
      {/* ─── Vignette overlay — absolute, scoped to hero section ─── */}
      <div
        className="pointer-events-none absolute inset-0 z-[5]"
        style={{
          background: 'radial-gradient(ellipse 50% 50% at center, transparent 60%, rgba(0,0,0,0.05) 100%)',
        }}
        aria-hidden="true"
      />

      {/* ─── Grain overlay — absolute, scoped to hero section ─── */}
      <div
        className="pointer-events-none absolute inset-0 z-[6]"
        style={{
          opacity: 0.035,
          backgroundImage: `url("${GRAIN_SVG}")`,
        }}
        aria-hidden="true"
      />

      {/* Responsive dark gradient overlay for text legibility */}
      <style>{`
        .hero-gradient {
          background: linear-gradient(to right, rgba(15,15,13,0.6) 0%, rgba(15,15,13,0.2) 100%);
        }
        @media (min-width: 768px) {
          .hero-gradient {
            background: linear-gradient(to right, rgba(15,15,13,0.85) 0%, rgba(15,15,13,0.7) 45%, rgba(15,15,13,0.3) 70%, transparent 100%);
          }
        }
      `}</style>
      <div
        className="pointer-events-none absolute inset-0 z-[7] hero-gradient"
        style={{
          opacity: 0,
          animation: 'statusFadeUp 1s 2.1s cubic-bezier(0.16,1,0.3,1) forwards',
        }}
        aria-hidden="true"
      />


      {/* ─── Content overlay ─── */}
      <div className="relative z-10 flex min-h-[80dvh] md:min-h-[100dvh] flex-col justify-center px-[7vw] pt-[8vh] md:pt-[10vh]" style={{ pointerEvents: 'none' }}>
        <div>
          {/* ─── version tag ─── */}
          <p
            className="mb-5 font-mono font-light text-xs tracking-[0.1em]"
            style={{
              color: 'var(--color-text-muted)',
              opacity: 0,
              animation: 'statusFadeUp 0.8s 2.25s cubic-bezier(0.16,1,0.3,1) forwards',
            }}
          >
            <DimmedPunctuation>v3.0.0</DimmedPunctuation> &mdash; final year build
          </p>

          {/* ─── identity block ─── */}
          <div>
            <h1
              ref={heroRef}
              className="font-display uppercase tracking-[0.05em] -ml-[0.05em] text-[clamp(24px,8vw,80px)] md:text-[54px] font-bold leading-[1.0]"
              style={{
                color: '#f5f3ee',
                willChange: 'transform',
                textShadow: '0 4px 20px rgba(0,0,0,0.65)',
                opacity: 0,
                animation: 'statusFadeUp 1.1s 2.25s cubic-bezier(0.16,1,0.3,1) forwards',
              }}
            >
              Mukthanand
            </h1>
            <h1
              ref={heroAccentRef}
              className="font-display uppercase tracking-[0.05em] -ml-[0.05em] text-[clamp(24px,8vw,80px)] md:text-[54px] font-bold leading-[1.0]"
              style={{
                color: 'var(--color-accent)',
                willChange: 'transform',
                textShadow: '0 4px 20px rgba(0,0,0,0.65)',
                opacity: 0,
                animation: 'statusFadeUp 1.1s 2.4s cubic-bezier(0.16,1,0.3,1) forwards',
              }}
            >
              Reddy.
            </h1>

            {/* role line */}
            <div className="mt-2">
              <KineticSwapper
                prefix="Focused on"
                words={[
                  'Backend Systems',
                  'Full-Stack Applications',
                  'AI Products',
                ]}
                className="font-sans font-light text-base leading-relaxed"
                wordStyle={{ color: 'var(--color-accent)', textShadow: '0 2px 12px rgba(0,0,0,0.6)' }}
                interval={2500}
                as="p"
                style={{ color: 'var(--color-text-muted)', textShadow: '0 2px 12px rgba(0,0,0,0.8)' }}
              />
            </div>

            <p
              className="mt-3 max-w-[40ch] font-sans font-light text-sm md:text-lg leading-relaxed"
              style={{
                color: 'var(--color-text-secondary)',
                textShadow: '0 2px 12px rgba(0,0,0,0.5)',
                opacity: 0,
                animation: 'statusFadeUp 1s 2.65s cubic-bezier(0.16,1,0.3,1) forwards',
              }}
            >
              Software engineer focused on backend systems,{' '}
              <span className="text-nowrap">full-stack</span>{' '}
              applications, and AI-powered products.
              Built and contributed to Ask Your Corpus, EHRS, and
              open-source AI infrastructure at Viswam AI.
            </p>

            {/* CTA buttons */}
            <div
              className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
              style={{
                pointerEvents: 'auto',
                opacity: 0,
                animation: 'statusFadeUp 0.9s 2.85s cubic-bezier(0.16,1,0.3,1) forwards',
              }}
            >
              {/* primary CTA — gold filled + split-flap text + loop arrow */}
              <a
                href="#services"
                onClick={(e) => {
                  e.preventDefault();
                  const el = document.getElementById('services');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="group relative inline-flex justify-center items-center gap-2.5 rounded-[2px] bg-accent px-5 py-2.5 font-mono text-xs lowercase tracking-[0.08em] font-light text-[#0A0A0A] overflow-hidden transition-all duration-[150ms] hover:bg-accent-dim hover:-translate-y-px cursor-pointer"
              >
                <div className="relative h-[14px] overflow-hidden">
                  <span className="flex flex-col transition-transform duration-[350ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-1/2">
                    <span className="h-[14px] leading-none">view projects</span>
                    <span className="h-[14px] leading-none text-[#0A0A0A] opacity-75">view projects</span>
                  </span>
                </div>
                
                {/* Looping arrow swapper */}
                <div className="relative overflow-hidden w-3 h-3 flex items-center justify-center">
                  <span className="absolute transition-transform duration-300 group-hover:translate-x-4 flex items-center justify-center">
                    &rarr;
                  </span>
                  <span className="absolute -translate-x-4 transition-transform duration-300 group-hover:translate-x-0 flex items-center justify-center text-[#0A0A0A]">
                    &rarr;
                  </span>
                </div>
              </a>

              {/* secondary CTA — outline + corner bracket reveal + pdf tag + loop download icon */}
              <a
                href="https://drive.google.com/file/d/1x4HWdyhLU385gdNF4N_C3SwK1_5hhEGI/view?usp=sharing"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative inline-flex justify-center items-center gap-2.5 rounded-[2px] border border-border bg-bg-elevated sm:bg-transparent px-5 py-2.5 font-mono text-xs lowercase tracking-[0.08em] font-light text-fg transition-all duration-300 hover:text-accent hover:border-transparent hover:-translate-y-px"
              >
                {/* Corner Bracket Accents — reveal and slide inward on hover */}
                <span className="absolute top-0 left-0 w-1 h-1 border-t border-l border-accent opacity-0 scale-150 transition-all duration-[250ms] group-hover:opacity-100 group-hover:scale-100" />
                <span className="absolute top-0 right-0 w-1 h-1 border-t border-r border-accent opacity-0 scale-150 transition-all duration-[250ms] group-hover:opacity-100 group-hover:scale-100" />
                <span className="absolute bottom-0 left-0 w-1 h-1 border-b border-l border-accent opacity-0 scale-150 transition-all duration-[250ms] group-hover:opacity-100 group-hover:scale-100" />
                <span className="absolute bottom-0 right-0 w-1 h-1 border-b border-r border-accent opacity-0 scale-150 transition-all duration-[250ms] group-hover:opacity-100 group-hover:scale-100" />

                <span className="font-mono text-[9px] text-fg-muted/50 lowercase tracking-normal mr-[-4px]">pdf //</span>
                
                <div className="relative h-[14px] overflow-hidden">
                  <span className="flex flex-col transition-transform duration-[350ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-1/2">
                    <span className="h-[14px] leading-none">download resume</span>
                    <span className="h-[14px] leading-none text-accent">download resume</span>
                  </span>
                </div>

                {/* Looping download icon */}
                <div className="relative overflow-hidden w-3.5 h-3.5 flex items-center justify-center">
                  <svg 
                    className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-y-4" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2"
                  >
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                  </svg>
                  <svg 
                    className="absolute -translate-y-4 h-3.5 w-3.5 text-accent transition-transform duration-300 group-hover:translate-y-0" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2"
                  >
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                  </svg>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>


      {/* Viewfinder scroll indicator — fixed to viewport, fades out on first scroll */}
      <div 
        style={{
          position: 'fixed',
          bottom: '24px',
          left: '50%',
          transform: visible ? 'translate(-50%, 0)' : 'translate(-50%, 12px)',
          opacity: visible ? scrollOpacity : 0,
          transition: visible 
            ? 'transform 1.2s cubic-bezier(0.16, 1, 0.3, 1)' 
            : 'opacity 0.6s ease, transform 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
          zIndex: 30,
        }}
        className="group flex flex-col items-center pointer-events-auto cursor-pointer"
        onClick={() => {
          const el = document.getElementById('services');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.25em]" style={{ color: 'var(--color-text-muted)' }}>
          explore
        </span>
        <div className="w-6 h-6 relative mt-1.5 group-hover:scale-110 transition-transform duration-300 animate-brackets-pulse">
          {/* Viewfinder corners — matching the wireframe rack chassis geometry */}
          <span className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-fg/65" />
          <span className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-fg/65" />
          <span className="absolute bottom-0 left-0 w-1.5 h-1.5 border-b border-l border-fg/65" />
          <span className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-fg/65" />
          
          {/* Faint radar pulse expanding ring */}
          <span className="absolute top-1/2 left-1/2 w-1.5 h-1.5 rounded-full border border-accent animate-radar-pulse" />
          
          {/* Pulsing center point — gold status indicator with ambient glow matching nav pill */}
          <span className="absolute top-1/2 left-1/2 w-1.5 h-1.5 rounded-full bg-accent group-hover:brightness-125 transition-all duration-300 animate-dot-glow" />
        </div>

        {/* Connector line */}
        <div className="h-4 w-[1px] bg-gradient-to-b from-accent to-transparent opacity-60 mt-2" />
        
        {/* Bouncing arrow and route label */}
        <div className="flex flex-col items-center mt-0.5 animate-arrow-bounce">
          <span className="text-[10px] text-accent leading-none font-sans">&darr;</span>
          <span className="font-mono text-[8px] tracking-[0.15em] text-fg-muted/40 uppercase mt-1">
            /services
          </span>
        </div>
      </div>

      {/* ─── Animation keyframes ─── */}
      <style>{`
        @keyframes statusFadeUp {
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bracketsPulse {
          0%, 100% { transform: scale(0.9); opacity: 0.4; }
          50% { transform: scale(1.12); opacity: 0.95; }
        }
        .animate-brackets-pulse {
          animation: bracketsPulse 2.8s ease-in-out infinite;
        }
        @keyframes dotGlow {
          0%, 100% { transform: translate(-50%, -50%) scale(0.85); opacity: 0.7; box-shadow: 0 0 4px var(--color-accent); }
          50% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; box-shadow: 0 0 10px var(--color-accent); }
        }
        .animate-dot-glow {
          animation: dotGlow 2.0s ease-in-out infinite;
        }
        @keyframes radarPulse {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 0.6; }
          100% { transform: translate(-50%, -50%) scale(1.8); opacity: 0; }
        }
        .animate-radar-pulse {
          animation: radarPulse 2.0s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
        }
        @keyframes arrowBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(3px); }
        }
        .animate-arrow-bounce {
          animation: arrowBounce 1.6s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .status-bar, .label, h1, h1 span, .sub, .actions, .hero-overlay {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
        }
        @media (max-width: 767px) {
          .hero-overlay {
            background: radial-gradient(
              ellipse 140% 70% at 50% 25%,
              rgba(15,15,13,0.65) 0%,
              rgba(15,15,13,0.35) 55%,
              transparent 100%
            ) !important;
          }
        }
      `}</style>
    </section>
  );
}