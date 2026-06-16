import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Section } from '../components/Section';
import { Ticker } from '../components/Ticker';
import { useKineticScroll } from '../motion/useKineticScroll';
import { KineticSwapper } from '../components/KineticSwapper';
import { ServerRack } from '../components/ServerRack';

/* ============================================================
   specs-v2/001-status.md — Hero /status
   No entrance animation — BootLoader handles all Stage 4 reveals.
   Two-column identity + status sidebar layout.
   ============================================================ */

/* ─── status sidebar block ─── */
function StatusBlock({
  label,
  value,
  sub,
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
}) {
  return (
    <div>
      <p className="mb-2 font-mono text-xs uppercase tracking-[0.1em] text-fg-muted">
        {label}
      </p>
      <p className="font-sans text-md font-medium text-fg">{value}</p>
      {sub && (
        <p className="mt-0.5 font-sans text-sm leading-relaxed text-fg-secondary">
          {sub}
        </p>
      )}
    </div>
  );
}

/* ─── divider between sidebar blocks ─── */
function StatusSeparator() {
  return <div className="h-px bg-border" />;
}

/* ============================================================
   /status section — specs-v2/001-status.md
   Layout:
     Version tag
     Two-column grid: identity (left) + status sidebar (right)
     Ticker
     Project preview cards
   ============================================================ */
export function Status() {
  const heroRef = useKineticScroll<HTMLHeadingElement>({ maxSkew: 2 });
  const heroAccentRef = useKineticScroll<HTMLHeadingElement>({ maxSkew: 2 });

  return (
    <Section id="status" label="/status" className="pt-[48px]">
      {/* ─── 3D server rack background ─── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
        <ServerRack />
        {/* Vignette overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.55) 100%)',
            zIndex: 1,
          }}
        />
        {/* Film grain overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            opacity: 0.035,
            zIndex: 2,
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
            backgroundSize: '100px 100px',
          }}
        />
      </div>

      {/* ─── version tag ─── */}
      <p className="mb-8 font-mono text-xs uppercase tracking-[0.1em] text-accent">
        v2.0.0 &mdash; FINAL YEAR BUILD
      </p>

      {/* ─── two-column hero ─── */}
      <div className="grid gap-12 lg:grid-cols-[1fr_auto]">
        {/* ─── identity block (left) ─── */}
        <div>
          <h1 ref={heroRef} className="text-[clamp(52px,8vw,88px)] font-bold leading-[1.0] text-fg" style={{ willChange: 'transform' }}>
            Mukthanand
          </h1>
          <h1 ref={heroAccentRef} className="text-[clamp(52px,8vw,88px)] font-bold leading-[1.0] text-accent" style={{ willChange: 'transform' }}>
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
              className="font-sans text-base leading-relaxed text-fg-secondary"
              wordClassName="text-accent"
              interval={2500}
              as="p"
            />
          </div>

          <p className="mt-6 font-sans text-lg leading-relaxed text-fg-secondary">
            Backend and full-stack engineer focused on building reliable AI-powered products.
            Built hybrid RAG retrieval for a 10k+ user open-source platform, and contributed to healthcare
            and language-tech systems at Viswam AI. Open to full-time roles in backend,
            full-stack, and AI engineering.
          </p>

          {/* CTA buttons */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
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

        {/* ─── status sidebar (right) — hidden on mobile, shown on lg ─── */}
        <aside className="hidden lg:block lg:w-64">
          <div className="flex flex-col gap-6 border-l border-border pl-8">
            <StatusBlock
              label="CURRENT FOCUS"
              value="AI Systems &amp; Backend Engineering"
            />
            <StatusSeparator />
            <StatusBlock
              label="RECENT IMPACT"
              value="Ask Your Corpus (RAG)"
              sub={"10k+ users \u2022 92% accuracy"}
            />
            <StatusSeparator />
            <StatusBlock
              label="AVAILABILITY"
              value="Open to Full-Time Roles"
              sub={
                <>
                  AI • Backend • Full-Stack<br />
                  Graduating 2026
                </>
              }
            />
          </div>
        </aside>
      </div>

      {/* ─── ticker ─── */}
      <div className="mt-20">
        <Ticker />
      </div>
    </Section>
  );
}
