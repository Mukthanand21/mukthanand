import { Link } from 'react-router-dom';
import { Ticker } from '../components/Ticker';
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
      className="relative min-h-screen overflow-hidden pt-6 -mx-gutter"
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
        className="pointer-events-none absolute inset-0 z-[7]"
        style={{
          background: 'linear-gradient(to right, rgba(15,15,13,0.85) 0%, rgba(15,15,13,0.7) 45%, rgba(15,15,13,0.3) 70%, transparent 100%)',
          opacity: 0,
          animation: 'statusFadeUp 1s 2.1s cubic-bezier(0.16,1,0.3,1) forwards',
        }}
        aria-hidden="true"
      />

      {/* ─── Content overlay ─── */}
      <div className="relative z-10 flex min-h-screen flex-col justify-center" style={{ pointerEvents: 'none', padding: '6vh 7vw' }}>
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
                    color: '#EF9F27',
                    willChange: 'transform',
                    opacity: 0,
                    animation: 'statusFadeUp 1.1s 2.4s cubic-bezier(0.16,1,0.3,1) forwards',
                  }}
                >
                  Reddy.
                </h1>

                {/* role line */}
                <div className="mt-4">
                  <KineticSwapper
                    prefix="Open to"
                    words={[
                      'AI roles',
                      'Backend roles',
                      'Full Stack roles',
                      'Applied AI roles',
                    ]}
                    className="font-sans text-base leading-relaxed"
                    wordStyle={{ color: '#D3D1C7' }}
                    interval={2500}
                    as="p"
                    style={{ color: '#888780' }}
                  />
                </div>

                <p
                  className="mt-6 max-w-[34ch] font-sans text-lg leading-relaxed"
                  style={{
                    color: '#888780',
                    opacity: 0,
                    animation: 'statusFadeUp 1s 2.65s cubic-bezier(0.16,1,0.3,1) forwards',
                  }}
                >
                  Backend & full-stack engineer. Builds retrieval systems,
                  agentic tooling, and tools for underserved communities.
                </p>

                {/* CTA buttons */}
                <div
                  className="mt-8 flex flex-wrap items-center gap-4"
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
                    <span>view services</span>
                    <span className="text-xs">&rarr;</span>
                  </Link>

                  {/* secondary CTA — outline */}
                  <Link
                    to="/changelog"
                    className="inline-flex items-center gap-2 rounded-lg border-thin border-border px-5 py-2.5 font-sans text-sm text-fg transition-colors duration-150 hover:border-accent hover:text-accent"
                  >
                    <span>read changelog</span>
                  </Link>
                </div>
              </div>
        </div>
      </div>

      {/* ─── ticker ─── */}
      <div className="relative z-10 mt-20">
        <Ticker />
      </div>

      {/* ─── Animation keyframes ─── */}
      <style>{`
        @keyframes statusFadeUp {
          to { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .status-bar, .label, h1, h1 span, .sub, .actions {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
        }
      `}</style>
    </section>
  );
}