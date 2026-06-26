import { Link } from 'react-router-dom';

import { useKineticScroll } from '../motion/useKineticScroll';
import { KineticSwapper } from '../components/KineticSwapper';
import { RackScene } from '../components/RackScene';
import { useBootComplete } from '../components/Layout';

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
  const bootComplete = useBootComplete();

  return (
    <section
      id="status"
      className="relative md:min-h-screen overflow-hidden pt-6 -mx-gutter"
      style={{ width: '100vw', marginLeft: 'calc(-50vw + 50%)' }}
    >
      {/* ─── 3D rack background ─── */}
      <RackScene bootComplete={bootComplete} />

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

      {/* ─── Dark gradient overlay — full-bleed behind text column for legibility over 3D rack ─── */}
      <div
        className="pointer-events-none absolute inset-0 z-[7] hero-overlay"
        style={{
          background: 'linear-gradient(to right, rgba(15,15,13,0.85) 0%, rgba(15,15,13,0.7) 45%, rgba(15,15,13,0.3) 70%, transparent 100%)',
          opacity: 0,
          animation: 'statusFadeUp 1s 2.1s cubic-bezier(0.16,1,0.3,1) forwards',
        }}
        aria-hidden="true"
      />



      {/* ─── Content overlay ─── */}
      <div className="relative z-10 flex md:min-h-screen min-h-[0px] flex-col md:justify-center justify-start" style={{ pointerEvents: 'none', padding: '10vh 7vw' }}>
        <div>
            {/* ─── version tag ─── */}
            <p
              className="mb-5 font-sans text-xs tracking-[0.1em]"
              style={{
                color: '#444441',
                opacity: 0,
                animation: 'statusFadeUp 1s 2.1s cubic-bezier(0.16,1,0.3,1) forwards',
              }}
            >
              v3.0.0 &mdash; final year build
            </p>

            {/* ─── identity block ─── */}
            <div>
                <h1
                  ref={heroRef}
                  className="text-[clamp(52px,8vw,88px)] font-bold leading-[1.0]"
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
                  className="text-[clamp(52px,8vw,88px)] font-bold leading-[1.0]"
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

                {/* gold accent line below name */}
                <div className="mt-1 mb-5 h-px w-12 bg-accent" />

                {/* role line */}
                <div className="mt-4">
                  <KineticSwapper
                    prefix="Focused on"
                    words={[
                      'Backend Systems',
                      'Full-Stack Applications',
                      'AI Products',
                      'Open Source',
                    ]}
                    className="font-sans text-base leading-relaxed"
                    wordStyle={{ color: 'var(--color-accent)' }}
                    interval={2500}
                    as="p"
                    style={{ color: '#888780' }}
                  />
                </div>

                <p
                  className="mt-4 max-w-[40ch] font-sans text-sm md:text-lg leading-relaxed"
                  style={{
                    color: '#B0A898',
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
                  className="mt-12 flex flex-wrap items-center gap-4"
                  style={{
                    pointerEvents: 'auto',
                    opacity: 0,
                    animation: 'statusFadeUp 0.9s 2.85s cubic-bezier(0.16,1,0.3,1) forwards',
                  }}
                >
                  {/* primary CTA — gold filled */}
                  <Link
                    to="/services"
                    className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 font-sans text-sm font-semibold text-[#0A0A0A] transition-all duration-[120ms] hover:bg-accent-dim hover:-translate-y-px"
                  >
                    <span>view projects</span>
                    <span className="text-xs">&rarr;</span>
                  </Link>

                  {/* secondary CTA — outline */}
                  <a
                    href="https://drive.google.com/file/d/1x4HWdyhLU385gdNF4N_C3SwK1_5hhEGI/view?usp=sharing"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg border-thin border-border px-5 py-2.5 font-sans text-sm text-fg transition-colors duration-150 hover:border-accent hover:text-accent md:bg-transparent bg-bg-elevated"
                  >
                    <span>download resume</span>
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
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