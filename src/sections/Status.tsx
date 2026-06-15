import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Section } from '../components/Section';
import { Ticker } from '../components/Ticker';
import { ObsidianVeil } from '../components/ObsidianVeil';
import { useKineticScroll } from '../motion/useKineticScroll';

/* ============================================================
   specs-v2/001-status.md — Hero /status
   No entrance animation — BootLoader handles all Stage 4 reveals.
   Two-column identity + status sidebar layout.
   ============================================================ */

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
      {/* ─── Hero background: Obsidian silk cloth ─── */}
      <div className="relative overflow-hidden -mx-gutter px-gutter min-h-[50vh]">
        <ObsidianVeil />

        {/* ─── version tag ─── */}
        <p className="mb-8 font-mono text-xs uppercase tracking-[0.1em] text-accent relative z-10">
          v3.0.0 &mdash; FINAL YEAR BUILD
        </p>

        {/* ─── two-column hero ─── */}
        <div className="grid gap-12 lg:grid-cols-[1fr_auto] relative z-10">
        {/* ─── identity block (left) ─── */}
        <div>
          <h1 ref={heroRef} className="text-[clamp(52px,8vw,88px)] font-bold leading-[1.0] text-fg" style={{ willChange: 'transform' }}>
            Mukthanand
          </h1>
          <h1 ref={heroAccentRef} className="text-[clamp(52px,8vw,88px)] font-bold leading-[1.0] text-accent" style={{ willChange: 'transform' }}>
            Reddy.
          </h1>

          <p className="mt-6 max-w-[420px] font-sans text-lg leading-relaxed text-fg-secondary">
            Backend &amp; full-stack engineer. Builds retrieval systems,
            agentic tooling, and tools for underserved communities.
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
      </div>

      {/* ─── ticker ─── */}
      <div className="mt-20">
        <Ticker />
      </div>

      {/* ─── project preview cards ─── */}
      <div className="mt-12">
        <p className="mb-6 font-mono text-xs uppercase tracking-[0.1em] text-fg-muted">
          Featured Services
        </p>
        <div className="grid gap-3">
          {previewProjects.map((project) => (
            <ProjectPreviewCard key={project.name} project={project} />
          ))}
        </div>
      </div>
    </Section>
  );
}
