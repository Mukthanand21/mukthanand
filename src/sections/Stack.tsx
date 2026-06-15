import { useState } from 'react';
import { motion, LayoutGroup } from 'framer-motion';
import { Section } from '../components/Section';
import { SkillIcon } from '../components/SkillIcon';
import { SkillConstellation } from '../components/SkillConstellation';
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
      { name: 'Python', level: 'strongest', note: 'Primary language across all projects' },
      { name: 'JavaScript', level: 'strong', note: 'Web frontends, scripting' },
      { name: 'TypeScript', level: 'strong', note: 'All frontend work post-2025' },
      { name: 'Java', level: 'familiar', note: 'Academic + DSA practice' },
      { name: 'C', level: 'familiar', note: 'Systems coursework' },
    ],
  },
  {
    id: 'backend',
    label: 'BACKEND',
    items: [
      { name: 'FastAPI', level: 'strongest', note: 'REST API backends, production services' },
      { name: 'PostgreSQL', level: 'strongest', note: 'RAG retrieval, complex queries, Alembic' },
      { name: 'Flask', level: 'strong', note: 'Pharmacy system, early projects' },
      { name: 'JWT', level: 'strong', note: 'RBAC, token flows, auth pipelines' },
      { name: 'MySQL', level: 'strong', note: 'Relational data modeling' },
      { name: 'Redis', level: 'familiar', note: 'Caching fundamentals' },
    ],
  },
  {
    id: 'frontend',
    label: 'FRONTEND',
    items: [
      { name: 'React', level: 'strong', note: 'Interactive UIs, component architecture' },
      { name: 'Vite', level: 'strong', note: 'Dev server, build tooling' },
      { name: 'Tailwind CSS', level: 'strong', note: 'Utility-first component styling' },
      { name: 'HTML5', level: 'strong', note: 'Semantic markup, accessibility' },
    ],
  },
  {
    id: 'data-ml',
    label: 'DATA & ML',
    items: [
      { name: 'Streamlit', level: 'strongest', note: 'ML demos, internal analytics tools' },
      { name: 'Pandas', level: 'strong', note: 'Data transformation, analysis pipelines' },
      { name: 'NumPy', level: 'strong', note: 'Numerical computing, array operations' },
      { name: 'scikit-learn', level: 'strong', note: 'ML models, classification, clustering' },
    ],
  },
  {
    id: 'devops',
    label: 'DEVOPS',
    items: [
      { name: 'GitLab', level: 'strong', note: 'Version control, project management' },
      { name: 'GitLab CI', level: 'strong', note: 'CI/CD pipelines, automated builds, Pages' },
      { name: 'Docker', level: 'strong', note: 'Containerisation, dev environments, CI' },
      { name: 'Postman', level: 'strong', note: 'API testing, collections, documentation' },
      { name: 'Markdown', level: 'strong', note: 'Documentation, READMEs, specs' },
      { name: 'ESLint', level: 'familiar', note: 'Code quality, consistent linting' },
      { name: 'Notion', level: 'familiar', note: 'Documentation, project tracking' },
      { name: 'Bruno', level: 'familiar', note: 'API testing client' },
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
          <SkillCard skill={skill} featured={i === 0} />
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
      <p className="mb-6 max-w-prose font-sans text-base leading-relaxed text-fg-secondary">
        Skills grouped by discipline. Move your cursor through the constellation.
      </p>

      {/* Interactive constellation */}
      <div className="mb-8">
        <SkillConstellation />
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
