import { Section } from '../components/Section';
import { Reveal } from '../motion/Reveal';

/* ─── skill group data — placeholder until #16 ─── */
type Level = 'strongest' | 'strong' | 'familiar';

type Skill = {
  name: string;
  level: Level;
};

type Group = {
  category: string;
  items: Skill[];
};

const groups: Group[] = [
  {
    category: 'Languages',
    items: [
      { name: 'Python', level: 'strongest' },
      { name: 'JavaScript / TypeScript', level: 'strong' },
      { name: 'SQL', level: 'strong' },
      { name: 'Java', level: 'familiar' },
    ],
  },
  {
    category: 'Backend',
    items: [
      { name: 'FastAPI', level: 'strongest' },
      { name: 'REST API Design', level: 'strongest' },
      { name: 'PostgreSQL', level: 'strong' },
      { name: 'RAG Pipelines', level: 'strong' },
      { name: 'FAISS', level: 'strong' },
      { name: 'API Gateway Patterns', level: 'strong' },
      { name: 'SQLAlchemy / Alembic', level: 'strong' },
    ],
  },
  {
    category: 'Frontend',
    items: [
      { name: 'React', level: 'strong' },
      { name: 'TypeScript', level: 'strong' },
      { name: 'Tailwind CSS', level: 'strong' },
      { name: 'HTML / CSS', level: 'strong' },
    ],
  },
  {
    category: 'DevOps & Tools',
    items: [
      { name: 'GitLab CI/CD', level: 'strong' },
      { name: 'Git (rebase, force-with-lease)', level: 'strong' },
      { name: 'Linux (Ubuntu)', level: 'strong' },
      { name: 'Docker', level: 'familiar' },
      { name: 'AWS (Cloud Foundations)', level: 'familiar' },
    ],
  },
  {
    category: 'AI & ML',
    items: [
      { name: 'Hybrid Retrieval (FTS + pg_trgm)', level: 'strongest' },
      { name: 'Prompt Engineering', level: 'strong' },
      { name: 'Groq API / LLM Integration', level: 'strong' },
      { name: 'Sentence-Transformers', level: 'familiar' },
      { name: 'wav2vec2 / ASR', level: 'familiar' },
    ],
  },
];

/* ─── dot color mapping per spec ─── */
const DOT_COLORS: Record<Level, string> = {
  strongest: 'bg-accent',       // gold
  strong: 'bg-success',          // sage green
  familiar: 'bg-fg-muted',      // plum-muted
};

/* ─── label mapping (uppercase per spec) ─── */
const LEVEL_LABELS: Record<Level, string> = {
  strongest: 'STRONGEST',
  strong: 'STRONG',
  familiar: 'FAMILIAR',
};

/* ─── single skill row ─── */
function SkillRow({ skill }: { skill: Skill }) {
  return (
    <span className="group inline-flex items-center gap-2">
      {/* skill name */}
      <span className="text-md font-medium text-fg transition-colors duration-150 group-hover:text-accent">
        {skill.name}
      </span>

      {/* proficiency dot */}
      <span
        className={`inline-block h-1.5 w-1.5 shrink-0 rounded-full ${DOT_COLORS[skill.level]}`}
        aria-hidden="true"
      />

      {/* proficiency label */}
      <span className="font-mono text-xs uppercase tracking-wider text-fg-muted">
        {LEVEL_LABELS[skill.level]}
      </span>
    </span>
  );
}

/* ─── skill group card ─── */
function SkillGroup({ group, index }: { group: Group; index: number }) {
  return (
    <Reveal delay={index * 0.08}>
      <div className="rounded-card border border-border bg-bg-elevated p-6">
        {/* category heading */}
        <h3 className="mb-6 font-mono text-xs uppercase tracking-[0.15em] text-fg-muted">
          {group.category}
        </h3>

        {/* skills list — wrapping flex row per spec */}
        <div className="flex flex-wrap gap-x-8 gap-y-4">
          {group.items.map((skill) => (
            <SkillRow key={skill.name} skill={skill} />
          ))}
        </div>
      </div>
    </Reveal>
  );
}

/* ============================================================
   /stack section — specs-v2/004-stack.md
   Discipline groups with honest proficiency signaling
   ============================================================ */
export function Stack() {
  return (
    <Section id="stack" label="/stack">
      <p className="mb-12 max-w-prose text-base leading-relaxed text-fg-secondary">
        Skills grouped by discipline. Depth signaled honestly — no filler, no
        charts.
      </p>

      <div className="flex flex-col gap-5">
        {groups.map((group, i) => (
          <SkillGroup key={group.category} group={group} index={i} />
        ))}
      </div>
    </Section>
  );
}
