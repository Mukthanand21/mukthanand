import { useState, useEffect } from 'react';
import { Section } from '../components/Section';
import { Reveal } from '../motion/Reveal';
import { useBoot } from '../hooks/useBoot';

/* ─── changelog entry data — placeholder until #16 ─── */
type Entry = {
  version: string;
  date: string;
  title: string;
  description: string;
  tags?: string[];
};

const entries: Entry[] = [
  {
    version: 'v2.0.0',
    date: 'JUN 2026',
    title: 'Graduation Release',
    description:
      'Bachelor\'s degree completion — Ready to ship full-time: backend, full-stack, and AI roles.',
    tags: ['Education', 'B.Tech CSE'],
  },
  {
    version: 'v1.5.0',
    date: 'MAY 2026',
    title: 'Shipped Internship Report',
    description:
      'Completed and submitted internship report on Knowledge-Graph-Augmented Hybrid Retrieval for low-resource languages.',
    tags: ['Viswam AI', 'IIIT Hyderabad'],
  },
  {
    version: 'v1.4.0',
    date: 'APR 2026',
    title: 'Merged feat/rag — Hybrid Retrieval Live',
    description:
      'Merged the RAG retrieval feature to production on corpus.swecha.org. Postgres-native hybrid search (FTS + pg_trgm) with pgvector for semantic retrieval.',
    tags: ['corpus.swecha.org', 'PostgreSQL', 'pgvector'],
  },
  {
    version: 'v1.3.0',
    date: 'MAR 2026',
    title: 'Scheme Saathi — Telugu-First Telegram Bot',
    description:
      'Built a Telegram bot for discovering government schemes in Telugu. Won at the Aarna / Swecha Hackathon. Integrated intent classification and slot-filling for natural-language queries.',
    tags: ['Hackathon', 'Telegram', 'Telugu NLP'],
  },
  {
    version: 'v1.2.0',
    date: 'FEB 2026',
    title: 'Joined Viswam AI as Software & AI Intern',
    description:
      'Started an internship at Viswam AI, an IIIT Hyderabad initiative. Focused on RAG pipelines, retrieval systems, and AI tooling for underserved languages.',
    tags: ['Internship', 'Viswam AI', 'IIIT Hyderabad'],
  },
  {
    version: 'v1.1.0',
    date: 'JAN 2026',
    title: 'FAQ Sense — RAG FAQ Assistant',
    description:
      'Built and deployed a RAG-powered FAQ assistant on Streamlit Cloud. Uses Sentence Transformers for embeddings and Groq for fast LLM inference.',
    tags: ['Streamlit', 'Groq', 'RAG'],
  },
  {
    version: 'v1.0.0',
    date: 'AUG 2025',
    title: 'First Production Deploy',
    description:
      'Deployed Paste & Fix Agent — a debugging assistant powered by Groq LLM that accepts error logs and suggests fixes. First end-to-end AI tool shipped.',
    tags: ['Groq', 'Streamlit', 'AI Tooling'],
  },
  {
    version: 'v0.1.0',
    date: 'JUN 2022',
    title: 'Enrolled — B.Tech Computer Science & Engineering',
    description:
      'Began my undergraduate degree at ICFAI Foundation for Higher Education, Hyderabad. Laid the foundation in CS fundamentals, data structures, and algorithms.',
    tags: ['Education', 'ICFAI Tech'],
  },
];

/* ─── determine if a version is a major release (vX.0.0) ─── */
function isMajor(version: string): boolean {
  return /^v\d+\.0\.0$/.test(version);
}

/* ─── pill-style tag ─── */
function EntryTag({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-border bg-bg-elevated px-3 py-1 font-mono text-[10px] text-fg-muted">
      {label}
    </span>
  );
}

/* ============================================================
   /changelog section — specs-v2/003-changelog.md
   Vertical timeline with per-entry dot + connecting line.
   Dot aligned to version + date baseline (4px top offset).
   ============================================================ */
export function Changelog() {
  const { bootComplete } = useBoot();
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (bootComplete) {
      const t = setTimeout(() => setRevealed(true), 30);
      return () => clearTimeout(t);
    }
  }, [bootComplete]);

  function eStyle(anim: string, dur: number, del: number): React.CSSProperties {
    if (!revealed) return { opacity: 0 };
    return {
      animation: `${anim} ${dur}ms ${del}ms cubic-bezier(0.16, 1, 0.3, 1) forwards`,
      opacity: 0,
    };
  }

  const E = {
    title: eStyle('fadeDown', 900, 0),
    content: eStyle('fadeIn', 1, 200),
  };

  return (
    <Section id="changelog" label="/changelog">
      <p style={E.title} className="mb-12 max-w-prose text-base leading-relaxed text-fg-secondary">
        A record of builds, shipped features, and lessons learned.
      </p>

      <div style={E.content} className="max-w-2xl">
        {entries.map((entry, i) => {
          const major = isMajor(entry.version);
          const isLast = i === entries.length - 1;

          return (
            <div key={entry.version}>
              <Reveal delay={i * 0.06}>
                <div className="group flex items-start gap-5">
                  {/* ─── dot column ─── */}
                  <div className="flex shrink-0 flex-col items-center w-[20px]">
                    {/* dot */}
                    <div
                      className={`shrink-0 rounded-full bg-accent mt-[4px] ${
                        major ? 'h-3 w-3' : 'h-[10px] w-[10px]'
                      }`}
                    />
                    {/* connecting line — hidden on last entry */}
                    {!isLast && (
                      <div className="w-px flex-1 bg-border mt-[8px] min-h-[60px]" />
                    )}
                  </div>

                  {/* ─── content column ─── */}
                  <div className={`flex-1 ${!isLast ? 'pb-8' : ''}`}>
                    {/* header: version + date + tags */}
                    <div className="mb-2 flex flex-wrap items-center gap-2.5">
                      <span
                        className={`font-mono uppercase text-accent ${
                          major ? 'text-xs' : 'text-[11px]'
                        }`}
                      >
                        {entry.version}
                      </span>
                      <span className="font-mono text-[11px] text-fg-muted">
                        &mdash; {entry.date}
                      </span>
                      <span className="hidden sm:inline-flex sm:flex-wrap sm:items-center sm:gap-1.5">
                        {entry.tags?.map((tag) => (
                          <EntryTag key={tag} label={tag} />
                        ))}
                      </span>
                    </div>

                    {/* tags on mobile — separate row */}
                    {entry.tags && entry.tags.length > 0 && (
                      <div className="mb-2 flex flex-wrap gap-2 sm:hidden">
                        {entry.tags.map((tag) => (
                          <EntryTag key={tag} label={tag} />
                        ))}
                      </div>
                    )}

                    {/* title */}
                    <h3
                      className={`font-semibold text-fg transition-colors duration-150 group-hover:text-accent ${
                        major ? 'text-xl' : 'text-lg'
                      }`}
                    >
                      {entry.title}
                    </h3>

                    {/* description */}
                    <p className="mt-1.5 max-w-prose text-sm leading-relaxed text-fg-secondary">
                      {entry.description}
                    </p>
                  </div>
                </div>
              </Reveal>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
