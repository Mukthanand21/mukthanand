import { Link } from 'react-router-dom';
import { useEffect } from 'react';
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
      className="relative min-h-[100dvh] overflow-hidden pt-6"
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
      <div className="relative z-10 flex min-h-[100dvh] flex-col justify-start md:justify-center px-[7vw] pt-[8vh] md:pt-[10vh]" style={{ pointerEvents: 'none' }}>
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
                  'Open Source',
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
              className="mt-8 flex flex-row items-center gap-3"
              style={{
                pointerEvents: 'auto',
                opacity: 0,
                animation: 'statusFadeUp 0.9s 2.85s cubic-bezier(0.16,1,0.3,1) forwards',
              }}
            >
              {/* primary CTA — gold filled */}
              <Link
                to="/services"
                className="inline-flex justify-center items-center gap-2 rounded-[2px] bg-accent px-5 py-3 font-sans text-sm font-semibold text-[#0A0A0A] transition-all duration-[120ms] hover:bg-accent-dim hover:-translate-y-px"
              >
                <span>view projects</span>
                <span className="text-xs">&rarr;</span>
              </Link>

              {/* secondary CTA — outline */}
              <a
                href="https://drive.google.com/file/d/1x4HWdyhLU385gdNF4N_C3SwK1_5hhEGI/view?usp=sharing"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex justify-center items-center gap-2 rounded-[2px] border-thin border-border px-5 py-3 font-sans text-sm text-fg transition-colors duration-150 hover:border-accent hover:text-accent bg-bg-elevated sm:bg-transparent"
              >
                <span>download resume</span>
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg>
              </a>
            </div>
          </div>
        </div>
      </div>


      {/* ─── Animation keyframes ─── */}
      <style>{`
        @keyframes statusFadeUp {
          to { opacity: 1; transform: translateY(0); }
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