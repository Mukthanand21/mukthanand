import type { ReactNode } from 'react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Section } from '../components/Section';
import { Ticker } from '../components/Ticker';
import { useKineticScroll } from '../motion/useKineticScroll';
import { KineticSwapper } from '../components/KineticSwapper';
import { ServerRack } from '../components/ServerRack';
import { useBoot } from '../hooks/useBoot';

/* ============================================================
   Draft-matched Hero /status
   Staggered entrance animations triggered after boot:
   Status bar (1.8s) → Label (2.1s) → Heading (2.25s/2.4s)
   → Sub (2.65s) → Buttons (2.85s) → Rack readout (3.1s)
   ============================================================ */

/* ─── Entrance animation helper ─── */
const ENTRANCE_CSS = {
  transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
} as const;

function entranceStyle(animation: string, durationMs: number, delayMs: number, revealed: boolean): React.CSSProperties {
  if (!revealed) return { opacity: 0 };
  return {
    animation: `${animation} ${durationMs}ms ${delayMs}ms ${ENTRANCE_CSS.transitionTimingFunction} forwards`,
    opacity: 0,
  };
}

/* ─── project preview data (placeholder until issue #16) ─── */
type PreviewProject = {
  method: string;
  path: string;
  name: string;
  description: string;
  href: string;
  status: 'live' | 'in progress';
};

const previewProjects: PreviewProject[] = [
  {
    method: 'POST',
    path: '/retrieve',
    name: 'Ask Your Corpus',
    description:
      'Contributed to a shared RAG app — owned the Postgres-native retrieval layer with pgvector.',
    href: '#',
    status: 'live',
  },
  {
    method: 'POST',
    path: '/chat',
    name: 'Scheme Saathi',
    description:
      'Telugu-first Telegram bot for government scheme discovery, built at Aarna/Swecha Hackathon.',
    href: '#',
    status: 'live',
  },
  {
    method: 'GET',
    path: '/faq',
    name: 'FAQ Sense',
    description:
      'RAG-powered FAQ assistant deployed on Streamlit Cloud with Groq inference.',
    href: '#',
    status: 'live',
  },
];

/* ─── rack readout data (matches draft) ─── */
const RACK_READOUT = [
  { unit: 'U1', service: '/retrieve', tech: 'pgvector', state: 'live' as const },
  { unit: 'U2', service: '/chat', tech: 'scheme saathi', state: 'live' as const },
  { unit: 'U3', service: '/agentic', tech: 'tooling', state: 'idle' as const },
];

/* ─── method badge ─── */
function MethodBadge({ method }: { method: string }) {
  return (
    <span className="inline-flex rounded border-thin border-accent/20 bg-[#3D2A3D] px-2 py-0.5 font-mono text-xs font-semibold uppercase leading-none text-accent">
      {method}
    </span>
  );
}

/* ─── status indicator dot ─── */
function StatusDot({ status }: { status: PreviewProject['status'] }) {
  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-xs uppercase text-fg-muted">
      <span
        className={`inline-block h-1.5 w-1.5 rounded-full ${
          status === 'live' ? 'bg-success' : 'bg-accent'
        }`}
      />
      <span>{status}</span>
    </span>
  );
}

/* ─── project preview card (condensed /services card) ─── */
function ProjectPreviewCard({ project }: { project: PreviewProject }) {
  return (
    <article className="group rounded-card border-thin border-border bg-bg-elevated p-4 transition-all duration-150 hover:border-accent/20 hover:bg-[#453050] sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2.5">
            <MethodBadge method={project.method} />
            <span className="font-mono text-xs text-fg-muted">
              {project.path}
            </span>
            <StatusDot status={project.status} />
          </div>
          <h3 className="font-sans text-md font-semibold text-fg transition-colors duration-150 group-hover:text-accent">
            {project.name}
          </h3>
          <p className="mt-1 font-sans text-sm leading-relaxed text-fg-secondary">
            {project.description}
          </p>
        </div>

        <a
          href={project.href}
          className="mt-1 shrink-0 font-mono text-xs text-fg-muted transition-colors duration-150 hover:text-accent"
          aria-label={`View ${project.name}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          &rarr;
        </a>
      </div>
    </article>
  );
}

/* ─── status sidebar block ─── */
function StatusBlock({
  label,
  value,
  sub,
}: {
  label: string;
  value: ReactNode;
  sub?: string;
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
   /status section — Draft-matched Hero
   Layout:
     Status bar → Label → Two-column grid → Ticker → Cards → Rack readout
   All entrance animations staggered after boot.
   ============================================================ */
export function Status() {
  const { bootComplete } = useBoot();
  const heroRef = useKineticScroll<HTMLHeadingElement>({ maxSkew: 2 });
  const heroAccentRef = useKineticScroll<HTMLHeadingElement>({ maxSkew: 2 });

  /* ─── Entrance reveal (triggers after boot) ─── */
  const [revealed, setRevealed] = useState(false);
  useEffect(() => {
    if (bootComplete) {
      const t = setTimeout(() => setRevealed(true), 30);
      return () => clearTimeout(t);
    }
  }, [bootComplete]);

  /* ─── Dynamic load readout ─── */
  const [loadVal, setLoadVal] = useState('0.42');
  useEffect(() => {
    const id = setInterval(() => {
      setLoadVal((0.3 + Math.random() * 0.25).toFixed(2));
    }, 2500);
    return () => clearInterval(id);
  }, []);

  /* ─── Entrance delay map (matches draft timings) ─── */
  const E = {
    bar:     entranceStyle('fadeDown', 900,  0,   revealed),
    label:   entranceStyle('fadeUp',  1000, 300, revealed),
    heading: entranceStyle('fadeUp',  1100, 450, revealed),
    accent:  entranceStyle('fadeUp',  1100, 600, revealed),
    sub:     entranceStyle('fadeUp',  1000, 850, revealed),
    actions: entranceStyle('fadeUp',  900,  1050, revealed),
    rack:    entranceStyle('fadeIn',  1000, 1300, revealed),
    content: entranceStyle('fadeIn',  1,    0,   revealed),
  };

  return (
    <Section id="status" label="/status" className="pt-[48px]">
      {/* ─── 3D server rack background ─── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
        <ServerRack startIntro={bootComplete} />
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

      {/* ─── Status bar (fadeDown from top) ─── */}
      <div
        style={E.bar}
        className="mb-8 flex flex-wrap gap-x-6 gap-y-1.5 font-mono text-xs tracking-[0.04em] text-fg-muted"
      >
        <span className="inline-flex items-center gap-1.5">
          <span
            className="inline-block h-1.5 w-1.5 rounded-full bg-success"
            style={{ boxShadow: '0 0 6px 1px rgba(93,202,165,0.6)' }}
          />
          {previewProjects.length} services running
        </span>
        <span className="text-accent">build v3.0.0</span>
        <span>uptime 142d 06:21:14</span>
        <span>region blr-1</span>
        <span>load {loadVal}</span>
      </div>

      {/* ─── /status label (fadeUp) ─── */}
      <p style={E.label} className="mb-6 font-mono text-xs uppercase tracking-[0.3em] text-accent">
        /status &mdash; final year build
      </p>

      {/* ─── two-column hero ─── */}
      <div style={E.content} className="grid gap-12 lg:grid-cols-[1fr_auto]">
        {/* ─── identity block (left) ─── */}
        <div>
          <h1 ref={heroRef} style={{ ...E.heading, willChange: 'transform' }} className="text-[clamp(52px,8vw,88px)] font-bold leading-[1.0] text-fg">
            Mukthanand
          </h1>
          <h1 ref={heroAccentRef} style={{ ...E.accent, willChange: 'transform' }} className="text-[clamp(52px,8vw,88px)] font-bold leading-[1.0] text-accent">
            Reddy.
          </h1>

          {/* role line */}
          <div style={E.sub} className="mt-4">
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

          <p style={E.sub} className="mt-6 max-w-[420px] font-sans text-lg leading-relaxed text-fg-secondary">
            Backend &amp; full-stack engineer. Builds retrieval systems,
            agentic tooling, and tools for underserved communities.
          </p>

          {/* CTA buttons */}
          <div style={E.actions} className="mt-8 flex flex-wrap items-center gap-4">
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
          <div style={E.content} className="flex flex-col gap-6 border-l border-border pl-8">
            <StatusBlock
              label="CURRENT STATUS"
              value="Hybrid RAG retrieval"
              sub="corpus.swecha.org — in progress"
            />
            <StatusSeparator />
            <StatusBlock
              label="LAST DEPLOYED"
              value="v1.4.0"
              sub="feat/rag merged to main"
            />
            <StatusSeparator />
            <StatusBlock
              label="AVAILABILITY"
              value={
                <span className="inline-flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-success" />
                  Open to roles — Jun 2026
                </span>
              }
            />
          </div>
        </aside>
      </div>

      {/* ─── ticker ─── */}
      <div style={E.content} className="mt-20">
        <Ticker />
      </div>

      {/* ─── project preview cards ─── */}
      <div style={E.content} className="mt-12">
        <p className="mb-6 font-mono text-xs uppercase tracking-[0.1em] text-fg-muted">
          Featured Services
        </p>
        <div className="grid gap-3">
          {previewProjects.map((project) => (
            <ProjectPreviewCard key={project.name} project={project} />
          ))}
        </div>
      </div>

      {/* ─── Rack readout footer (fadeIn, draft-matched) ─── */}
      <div
        style={E.rack}
        className="mt-20 flex flex-wrap justify-between gap-x-6 gap-y-2 font-mono text-xs tracking-[0.08em] text-fg-muted/40"
      >
        {RACK_READOUT.map((item) => (
          <span key={item.unit}>
            <span className="text-accent/60">{item.unit}</span>
            &nbsp;{item.service} &middot; {item.tech} &middot; {item.state}
          </span>
        ))}
      </div>
    </Section>
  );
}
