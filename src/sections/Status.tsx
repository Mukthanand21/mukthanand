import { Link } from 'react-router-dom';
import { Section } from '../components/Section';
import { Reveal } from '../motion/Reveal';
import { Ticker } from '../components/Ticker';

/* ============================================================
   Project preview cards — condensed version of /services cards
   specs-v2/001-status.md "Below the ticker: 3 project preview cards"
   ============================================================ */

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
    <span className="inline-flex rounded border border-accent/20 bg-accent/10 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase leading-none text-accent">
      {method}
    </span>
  );
}

/* ─── status indicator dot ─── */
function StatusDot({ status }: { status: PreviewProject['status'] }) {
  const color = status === 'live' ? 'bg-success' : 'bg-accent';
  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-fg-muted">
      <span className={`inline-block h-1.5 w-1.5 rounded-full ${color}`} />
      <span>{status}</span>
    </span>
  );
}

/* ─── single project preview card ─── */
function ProjectPreviewCard({
  project,
  index,
}: {
  project: PreviewProject;
  index: number;
}) {
  return (
    <Reveal delay={0.35 + index * 0.08}>
      <article className="group rounded-card border border-border bg-bg-elevated p-5 transition-all duration-150 hover:border-bg-subtle hover:bg-[#453050] sm:p-6">
        <div className="flex items-start justify-between gap-4">
          {/* left: method badge + name */}
          <div className="min-w-0">
            <div className="mb-2 flex items-center gap-2.5">
              <MethodBadge method={project.method} />
              <span className="font-mono text-xs text-fg-muted">
                {project.path}
              </span>
              <StatusDot status={project.status} />
            </div>
            <h3 className="text-md font-semibold text-fg transition-colors duration-150 group-hover:text-accent">
              {project.name}
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-fg-secondary">
              {project.description}
            </p>
          </div>

          {/* right: link */}
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
    </Reveal>
  );
}

/* ─── status sidebar block ─── */
function StatusBlock({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div>
      <p className="mb-2 font-mono text-xs uppercase tracking-widest text-fg-muted">
        {label}
      </p>
      <p className="text-md font-medium text-fg">{value}</p>
      {sub && (
        <p className="mt-0.5 text-sm leading-relaxed text-fg-secondary">
          {sub}
        </p>
      )}
    </div>
  );
}

/* ─── separator between sidebar blocks ─── */
function StatusSeparator() {
  return <div className="h-px bg-border" />;
}

/* ============================================================
   /status hero section — specs-v2/001-status.md
   Two-column layout: identity left + status sidebar right
   Collapses to single column below 768px
   ============================================================ */
export function Status() {
  return (
    <Section id="status" label="/status">
      {/* ─── version tag ─── */}
      <Reveal>
        <p className="mb-8 font-mono text-xs uppercase tracking-widest text-accent">
          v2.0.0 &mdash; FINAL YEAR BUILD
        </p>
      </Reveal>

      {/* ─── two-column hero ─── */}
      <div className="grid gap-12 lg:grid-cols-[1fr_auto]">
        {/* ─── identity block (left) ─── */}
        <div>
          {/* name line 1 */}
          <Reveal delay={0.05}>
            <h1 className="text-hero font-bold text-fg">
              Mukthanand
            </h1>
          </Reveal>

          {/* name line 2 — gold accent */}
          <Reveal delay={0.1}>
            <h1 className="text-hero font-bold text-accent">
              Reddy.
            </h1>
          </Reveal>

          {/* description */}
          <Reveal delay={0.15}>
            <p className="mt-6 max-w-prose text-lg leading-relaxed text-fg-secondary">
              Backend &amp; full-stack engineer. Builds retrieval systems,
              agentic tooling, and tools for underserved communities.
            </p>
          </Reveal>

          {/* CTA buttons */}
          <Reveal delay={0.2}>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              {/* primary CTA — gold filled */}
              <Link
                to="/services"
                className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 font-mono text-sm font-semibold text-[#0A0A0A] transition-all duration-[120ms] hover:bg-accent-dim hover:-translate-y-px"
              >
                <span>view services</span>
                <span className="text-xs">&rarr;</span>
              </Link>

              {/* secondary CTA — outline */}
              <Link
                to="/changelog"
                className="inline-flex items-center gap-2 rounded-lg border border-border px-5 py-2.5 font-mono text-sm text-fg transition-all duration-150 hover:border-accent hover:text-accent"
              >
                <span>read changelog</span>
              </Link>
            </div>
          </Reveal>
        </div>

        {/* ─── status sidebar (right) — hidden on mobile, shown on lg ─── */}
        <Reveal delay={0.15}>
          <aside className="lg:w-64">
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
                value="● Open to roles — Jun 2026"
              />
            </div>
          </aside>
        </Reveal>
      </div>

      {/* ─── ticker ─── */}
      <div className="mt-20">
        <Reveal delay={0.25}>
          <Ticker />
        </Reveal>
      </div>

      {/* ─── project preview cards ─── */}
      <div className="mt-12">
        <Reveal delay={0.3}>
          <p className="mb-6 font-mono text-xs uppercase tracking-widest text-fg-muted">
            Featured Services
          </p>
        </Reveal>
        <div className="grid gap-4">
          {previewProjects.map((project, i) => (
            <ProjectPreviewCard key={project.name} project={project} index={i} />
          ))}
        </div>
      </div>
    </Section>
  );
}
