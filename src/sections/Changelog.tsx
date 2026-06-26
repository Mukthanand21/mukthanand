import { Section } from '../components/Section';

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
      'Completed B.Tech in Computer Science & Engineering at ICFAI Tech Hyderabad. CGPA 8.05. Ready to ship full-time across backend, full-stack, and AI engineering roles.',
    tags: ['Education', 'B.Tech CSE', 'ICFAI Tech Hyderabad'],
  },
  {
    version: 'v1.4.0',
    date: 'APR 2026',
    title: 'Ask Your Corpus — Hybrid RAG Live',
    description:
      'Owned and shipped the full RAG retrieval feature for corpus.swecha.org. Hybrid FTS + pg_trgm, BYOK LLM architecture, sub-second retrieval. Also shipped Spotify-style transcript sync UI and API cleanup MRs.',
    tags: ['corpus.swecha.org', 'PostgreSQL', 'FastAPI', 'React'],
  },
  {
    version: 'v1.3.0',
    date: 'MAR 2026',
    title: 'Scheme Saathi — 48hr Hackathon Ship',
    description:
      'Built and deployed a Telugu-first Telegram bot at a 48hr Aarna/Swecha hackathon. Talked directly to SMB owners and auto drivers to validate the problem. Added voice I/O using Groq API. Also shipped unregister-doctor feature full-stack on EHRS.',
    tags: ['Hackathon', 'Telugu NLP', 'Telegram', 'EHRS'],
  },
  {
    version: 'v1.2.0',
    date: 'FEB 2026',
    title: 'EHRS Contributions — Healthcare Platform',
    description:
      'Contributed to the EHRS open-source healthcare platform — frontend fixes, unit tests, and UI improvements. First production MRs merged into a shared medical-camp platform used by real clinics.',
    tags: ['EHRS', 'Healthcare', 'React', 'FastAPI'],
  },
  {
    version: 'v1.1.0',
    date: 'JAN 2026',
    title: 'Joined Viswam AI — FAQSense Shipped',
    description:
      'Joined Viswam AI (IIIT Hyderabad initiative) as AI Developer Intern. First month: Linux, version control, prompt engineering, agentic AI. Shipped FAQSense, a semantic FAQ search assistant, at a hackathon. Live on Streamlit Cloud.',
    tags: ['Viswam AI', 'IIIT Hyderabad', 'FAQ Sense', 'Streamlit'],
  },
  {
    version: 'v1.0.0',
    date: 'JUN 2024',
    title: 'First Open Source Contribution — Skillbanc',
    description:
      'Contributed to the Skillbanc Manim Templates open-source repo. Built math animations for Indian school textbooks (Grades 1,2,6,8,9) covering Fractions, Decimals, Exponents, and Geometric Constructions. First experience with Git, GitHub, branches, and PRs.',
    tags: ['Open Source', 'Python', 'Manim', 'Education'],
  },
];

function isMajor(version: string): boolean {
  return /^v\d+\.0\.0$/.test(version);
}

function EntryTag({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-border bg-bg-elevated px-3 py-1 font-mono text-[10px] text-fg-muted">
      {label}
    </span>
  );
}

export function Changelog() {
  return (
    <Section id="changelog" label="/changelog">
      <style>{`
        .animate-dot-pulse {
          animation: dot-pulse 2.5s ease-in-out infinite;
        }
        @keyframes dot-pulse {
          0%, 100% { transform: scale(1); opacity: 0.25; }
          50% { transform: scale(1.6); opacity: 0.08; }
        }
        .changelog-line {
          position: relative;
        }
        .changelog-line::after {
          content: '';
          position: absolute;
          top: 12px;
          left: 9px;
          width: 2px;
          height: calc(100% + 8px);
          background: linear-gradient(to bottom, var(--color-accent), var(--color-border));
          opacity: 0.5;
        }
        .changelog-line:last-child::after {
          display: none;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-dot-pulse {
            animation: none !important;
            opacity: 0.15 !important;
          }
        }
      `}</style>
      <div className="mb-12">
        <p className="max-w-prose text-base leading-relaxed text-fg-secondary" data-section-desc>
          A record of builds, shipped features, and lessons learned.
        </p>
        <p className="mt-2 font-mono text-xs text-fg-muted" data-section-meta>
          {entries.length} releases &middot; latest {entries[0].version} &middot; {entries.filter(e => isMajor(e.version)).length} major
        </p>
      </div>

      <div className="max-w-2xl">
        {entries.map((entry, i) => {
          const major = isMajor(entry.version);
          const isLast = i === entries.length - 1;

          return (
            <div
              key={entry.version}
              data-section-card
              className="group flex items-start gap-5 pb-8 last:pb-0"
            >
              <div className="flex shrink-0 flex-col items-center w-[20px]">
                <div className="relative flex items-center justify-center mt-[4px] shrink-0">
                  <div
                    className={`absolute rounded-full bg-accent/25 animate-dot-pulse ${
                      major ? 'h-[18px] w-[18px]' : 'h-[15px] w-[15px]'
                    }`}
                  />
                  <div
                    className={`rounded-full bg-accent transition-transform duration-300 group-hover:scale-125 ${
                      major ? 'h-3 w-3' : 'h-[10px] w-[10px]'
                    }`}
                  />
                </div>
                {!isLast && (
                  <div className="w-px flex-1 mt-[8px] min-h-[60px] bg-gradient-to-b from-accent to-border opacity-50" />
                )}
              </div>

              <div className="flex-1 min-w-0">
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

                {entry.tags && entry.tags.length > 0 && (
                  <div className="mb-2 flex flex-wrap gap-2 sm:hidden">
                    {entry.tags.map((tag) => (
                      <EntryTag key={tag} label={tag} />
                    ))}
                  </div>
                )}

                <h3
                  className={`font-semibold text-fg transition-colors duration-150 group-hover:text-accent ${
                    major ? 'text-xl' : 'text-lg'
                  }`}
                >
                  {entry.title}
                </h3>

                <p className="mt-1.5 max-w-prose text-sm leading-relaxed text-fg-secondary">
                  {entry.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
