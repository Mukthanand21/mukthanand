import { useState } from 'react';
import { motion, LayoutGroup } from 'framer-motion';
import { Section } from '../components/Section';
import { SkillIcon } from '../components/SkillIcon';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { useMagneticTilt } from '../hooks/useMagneticTilt';

/* ─── types ─── */
type Level = 'strongest' | 'strong' | 'familiar';

type Skill = {
  name: string;
  level: Level;
  note: string;
  url?: string;
};

type Group = {
  id: string;
  label: string;
  items: Skill[];
};

/* ─── skill data ─── */
const groups: Group[] = [
  {
    id: 'languages',
    label: 'LANGUAGES',
    items: [
      { name: 'Python', level: 'strongest', note: 'Daily use across all projects' },
      { name: 'JavaScript/TypeScript', level: 'strong', note: 'React frontends, scripts' },
      { name: 'SQL', level: 'strong', note: 'PostgreSQL, complex queries' },
      { name: 'Java', level: 'familiar', note: 'Academic, DSA' },
      { name: 'C', level: 'familiar', note: 'Systems coursework' },
    ],
  },
  {
    id: 'backend',
    label: 'BACKEND',
    items: [
      { name: 'FastAPI', level: 'strongest', note: '3 production backends' },
      { name: 'PostgreSQL', level: 'strongest', note: 'RAG retrieval, EHRS, migrations' },
      { name: 'REST API Design', level: 'strong', note: 'Endpoint design, RBAC, versioning' },
      { name: 'Flask', level: 'strong', note: 'MediFlow AI, early projects' },
      { name: 'SQLAlchemy/Alembic', level: 'strong', note: 'ORM, migrations' },
      { name: 'RAG Pipelines', level: 'strong', note: 'Hybrid FTS + pg_trgm, BYOK LLM' },
    ],
  },
  {
    id: 'frontend',
    label: 'FRONTEND',
    items: [
      { name: 'React', level: 'strong', note: 'Corpus client, EHRS frontend' },
      { name: 'TypeScript', level: 'strong', note: 'All frontend work 2025+' },
      { name: 'Tailwind CSS', level: 'strong', note: 'Component styling' },
      { name: 'HTML/CSS', level: 'strong', note: 'Semantic markup, accessibility' },
    ],
  },
  {
    id: 'devops',
    label: 'DEVOPS & TOOLS',
    items: [
      { name: 'Git', level: 'strong', note: 'Rebase, force-with-lease, protected branches' },
      { name: 'GitLab CI/CD', level: 'strong', note: 'Pipelines, Docker-based CI, Pages deploy' },
      { name: 'Linux (Ubuntu)', level: 'strong', note: 'Daily driver, VM tuning, kernel modules' },
      { name: 'Bruno', level: 'strong', note: 'API testing, collection management' },
      { name: 'Docker', level: 'familiar', note: 'Containerisation basics, CI usage' },
    ],
  },
  {
    id: 'ai-ml',
    label: 'AI & ML',
    items: [
      { name: 'Hybrid Retrieval (FTS + pg_trgm)', level: 'strongest', note: 'No vector DB RAG' },
      { name: 'Prompt Engineering', level: 'strong', note: 'Structured outputs, agent skills' },
      { name: 'Groq / LLM APIs', level: 'strong', note: 'BYOK architecture, multi-provider' },
      { name: 'Agentic AI / Skills', level: 'strong', note: 'Custom skill creation, Viswam AI' },
      { name: 'Sentence-Transformers', level: 'familiar', note: 'FAQSense, semantic search' },
      { name: 'Linear Regression ML', level: 'familiar', note: 'MediFlow AI sales predictor' },
    ],
  },
];

/* ─── proficiency helpers ─── */
const LEVEL_BLOCKS: Record<Level, { blocks: string; color: string }> = {
  strongest: { blocks: '\u25A0 \u25A0 \u25A0', color: 'text-accent' },
  strong: { blocks: '\u25A0 \u25A0 \u25A1', color: 'text-success' },
  familiar: { blocks: '\u25A0 \u25A1 \u25A1', color: 'text-fg-muted' },
};

function levelNumber(level: Level): number {
  return level === 'strongest' ? 3 : level === 'strong' ? 2 : 1;
}

/* ─── unified skill card ───
   featured prop uses larger name size for visual hierarchy
   ============================================================ */
function SkillCard({ skill, featured }: { skill: Skill; featured?: boolean }) {
  const meta = LEVEL_BLOCKS[skill.level];
  const tiltRef = useMagneticTilt<HTMLDivElement>();

  return (
    <div
      ref={tiltRef}
      className={`group rounded-card border-thin border-border bg-bg-subtle p-4 transition-[background,border-color] duration-150 hover:border-accent/15 hover:shadow-[0_0_20px_-10px_rgba(232,182,90,0.05)] ${
        featured ? 'shadow-[0_0_24px_-16px_rgba(232,182,90,0.06)]' : ''
      }`}
    >
      {/* proficiency blocks */}
      <div className={`mb-1.5 font-mono text-[10px] uppercase tracking-[0.12em] ${meta.color}`}>
        {meta.blocks}
      </div>

      {/* skill name + icon */}
      <div
        className={`mb-1 flex items-center gap-1.5 font-sans font-medium text-fg transition-colors duration-150 group-hover:text-accent ${
          featured ? 'text-[17px]' : 'text-[14px]'
        }`}
      >
        <SkillIcon name={skill.name} />
        {skill.name}
      </div>

      {/* note + optional external link */}
      <div className="flex items-start justify-between gap-3">
        <div className="font-sans text-xs leading-relaxed text-fg-muted">
          {skill.note}
        </div>
        {skill.url && (
          <a
            href={skill.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-0.5 shrink-0 text-fg-muted/30 transition-colors duration-150 hover:text-accent"
            aria-label={`${skill.name} — view project`}
          >
            <svg viewBox="0 0 24 24" className="h-3 w-3" fill="currentColor" aria-hidden="true">
              <path d="M21 13v10h-21v-19h12v2h-10v15h17v-8h2zm3-12h-9.988l4.365 4.366-9.502 9.502 1.658 1.658 9.502-9.502 4.26 4.259.013-10.283h-.308z"/>
            </svg>
          </a>
        )}
      </div>
    </div>
  );
}

/* ─── tab panel content ─── */
function TabPanel({ group }: { group: Group }) {
  const reduced = usePrefersReducedMotion();
  const sorted = [...group.items].sort((a, b) => levelNumber(b.level) - levelNumber(a.level));

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {sorted.map((skill, i) => (
        <motion.div
          key={skill.name}
          initial={reduced ? {} : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1], delay: reduced ? 0 : i * 0.06 }}
        >
          <div data-section-card>
            <SkillCard skill={skill} featured={i === 0} />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/* ─── tab pill ─── */
function TabPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative rounded-full border-thin bg-transparent px-3 py-1 font-mono text-[10px] uppercase tracking-[0.1em] transition-colors duration-150 ${
        active
          ? 'border-border text-accent'
          : 'border-border text-fg-muted hover:text-fg-muted/80'
      }`}
    >
      {label}
      {active && (
        <motion.div
          layoutId="tab-underline"
          className="absolute -bottom-1 left-2 right-2 h-0.5 rounded-full bg-accent"
        />
      )}
    </button>
  );
}

/* ============================================================
   /stack section
   Tab-navigated discipline groups with featured skill cards
   ============================================================ */
export function Stack() {
  const [activeTab, setActiveTab] = useState(groups[0].id);
  const currentGroup = groups.find((g) => g.id === activeTab)!;

  return (
    <Section id="stack" label="/stack">
      <div className="mb-6">
        <p
          className="max-w-prose font-sans text-base leading-relaxed text-fg-secondary"
          data-section-desc
        >
          Skills grouped by discipline. Depth signaled honestly — no filler, no charts.
        </p>
        <p className="mt-2 font-mono text-xs text-fg-muted" data-section-meta>
          {groups.reduce((sum, g) => sum + g.items.length, 0)} packages installed &middot; {groups.length} categories
        </p>
      </div>

      {/* tab navigation */}
      <LayoutGroup>
        <div className="mb-7 flex flex-wrap gap-x-3 gap-y-2">
          {groups.map((g) => (
            <TabPill
              key={g.id}
              label={g.label}
              active={activeTab === g.id}
              onClick={() => setActiveTab(g.id)}
            />
          ))}
        </div>
      </LayoutGroup>

      {/* active tab panel */}
      <TabPanel key={currentGroup.id} group={currentGroup} />
    </Section>
  );
}
