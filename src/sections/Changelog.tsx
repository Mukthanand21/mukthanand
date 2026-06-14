import { Section } from '../components/Section';
import { Reveal } from '../motion/Reveal';

/* ─── changelog entry data ─── */
type Entry = {
  version: string;
  date: string;
  type: 'education' | 'experience' | 'milestone';
  title: string;
  description: string;
};

const entries: Entry[] = [
  {
    version: 'v2.0.0',
    date: '2026-07-XX',
    type: 'education',
    title: 'Graduation Release',
    description:
      'Bachelor\'s degree completion. Ready to ship full-time — backend, full-stack, and AI roles.',
  },
  {
    version: 'v1.5.0',
    date: '2026-04',
    type: 'milestone',
    title: 'Postgres-Native RAG System',
    description:
      'Built production-grade retrieval for Ask Your Corpus using pgvector — eliminated separate vector DB, achieved sub-second query times.',
  },
  {
    version: 'v1.3.0',
    date: '2025-11',
    type: 'milestone',
    title: 'RAG Pipeline Deep-Dive',
    description:
      'Developed end-to-end RAG pipelines integrating Sentence Transformers, Groq/LLaMA inference, and prompt engineering patterns.',
  },
  {
    version: 'v1.1.0',
    date: '2025-08',
    type: 'milestone',
    title: 'Portfolio (this site)',
    description:
      'Scaffolded full-stack portfolio as a production status-page metaphor — Vite + React + TypeScript + Tailwind, CI/CD, dark editorial design.',
  },
  {
    version: 'v1.0.0',
    date: '2025-05',
    type: 'experience',
    title: 'Initial Commit — Backend Foundations',
    description:
      'Solidified backend engineering skills: FastAPI, PostgreSQL, REST API design, and Linux/Git workflow. Began exploring AI/LLM integration.',
  },
];

/* ─── type badge ─── */
function TypeBadge({ type }: { type: Entry['type'] }) {
  const styles = {
    education: 'border-fg-faint/15 bg-surface/50 text-fg-muted',
    experience: 'border-fg-faint/15 bg-surface/50 text-fg-muted',
    milestone: 'border-accent/15 bg-accent/10 text-accent',
  };

  return (
    <span
      className={`inline-flex rounded-md border px-2 py-0.5 font-mono text-[11px] uppercase tracking-wider ${styles[type]}`}
    >
      {type}
    </span>
  );
}

/* ─── timeline connector ─── */
function TimelineConnector() {
  return (
    <div className="relative ml-[5px] mt-1 flex flex-col items-center">
      <div className="h-2.5 w-2.5 rounded-full border-2 border-fg-faint/20 bg-bg" />
      <div className="w-px flex-1 bg-gradient-to-b from-fg-faint/10 to-transparent" />
    </div>
  );
}

/* ─── individual entry ─── */
function ChangelogEntry({ entry, index }: { entry: Entry; index: number }) {
  return (
    <Reveal delay={index * 0.1}>
      <div className="group grid grid-cols-[auto_1fr] gap-6">
        {/* timeline column */}
        <div className="flex flex-col items-start">
          <TimelineConnector />
        </div>

        {/* content column */}
        <div className="pb-14 last:pb-0">
          {/* header: version + date + type */}
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <span className="font-mono text-sm font-semibold text-version">
              {entry.version}
            </span>
            <span className="font-mono text-xs text-fg-faint">
              {entry.date}
            </span>
            <TypeBadge type={entry.type} />
          </div>

          {/* title */}
          <h3 className="mb-2 font-display text-heading text-fg-strong transition-colors duration-300 group-hover:text-accent">
            {entry.title}
          </h3>

          {/* description */}
          <p className="max-w-prose leading-relaxed text-fg-muted">
            {entry.description}
          </p>
        </div>
      </div>
    </Reveal>
  );
}

/* ============================================================
   /changelog section
   ============================================================ */
export function Changelog() {
  return (
    <Section id="changelog" label="/changelog">
      <p className="mb-12 max-w-prose text-base leading-relaxed text-fg-muted">
        Journey and milestones as versioned releases — newest first.
      </p>

      <div className="max-w-2xl">
        {entries.map((entry, i) => (
          <ChangelogEntry key={entry.version} entry={entry} index={i} />
        ))}
      </div>
    </Section>
  );
}
