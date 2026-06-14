import { Section } from '../components/Section';
import { Reveal } from '../motion/Reveal';

/* ─── skill group data ─── */
type Skill = {
  name: string;
  level: 'strongest' | 'strong' | 'familiar';
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
    ],
  },
  {
    category: 'Frontend',
    items: [
      { name: 'React', level: 'strong' },
      { name: 'Vite', level: 'strong' },
      { name: 'Streamlit', level: 'strong' },
      { name: 'Tailwind CSS', level: 'strong' },
    ],
  },
  {
    category: 'DevOps / Tools',
    items: [
      { name: 'Git & GitLab CI/CD', level: 'strongest' },
      { name: 'Linux', level: 'strong' },
      { name: 'Docker', level: 'strong' },
      { name: 'Bruno', level: 'strong' },
      { name: 'YAML / Specs', level: 'strong' },
    ],
  },
  {
    category: 'AI / LLM',
    items: [
      { name: 'RAG Architecture', level: 'strong' },
      { name: 'Sentence Transformers', level: 'strong' },
      { name: 'Prompt Engineering', level: 'strong' },
      { name: 'Groq / LLaMA Integration', level: 'strong' },
      { name: 'Embeddings & Vector Search', level: 'strong' },
    ],
  },
];

/* ─── level indicator ─── */
function LevelDot({ level }: { level: Skill['level'] }) {
  const colors = {
    strongest: 'bg-accent',
    strong: 'bg-fg-muted',
    familiar: 'bg-fg-faint/40',
  };

  return (
    <span
      className={`inline-block h-1.5 w-1.5 rounded-full ${colors[level]}`}
      title={level}
    />
  );
}

/* ─── single skill row ─── */
function SkillRow({ skill }: { skill: Skill }) {
  const label =
    skill.level === 'strongest'
      ? 'strongest'
      : skill.level === 'strong'
        ? 'strong'
        : 'familiar';

  return (
    <span className="group inline-flex items-center gap-2">
      <span className="font-mono text-sm text-fg transition-colors duration-200 group-hover:text-accent">
        {skill.name}
      </span>
      <span className="inline-flex items-center gap-1">
        <LevelDot level={skill.level} />
      </span>
      <span className="font-mono text-[10px] uppercase tracking-widest text-fg-faint/50 transition-opacity duration-200 group-hover:opacity-100">
        {label}
      </span>
    </span>
  );
}

/* ─── skill group card ─── */
function SkillGroup({ group, index }: { group: Group; index: number }) {
  return (
    <Reveal delay={index * 0.1}>
      <div className="rounded-2xl border border-surface bg-bg-alt p-8 sm:p-10">
        {/* category heading */}
        <h3 className="mb-6 font-mono text-xs uppercase tracking-[0.15em] text-fg-muted">
          {group.category}
        </h3>

        {/* skills list */}
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
   /stack section
   ============================================================ */
export function Stack() {
  return (
    <Section id="stack" label="/stack">
      <p className="mb-12 max-w-prose text-base leading-relaxed text-fg-muted">
        Skills grouped by discipline. Depth signaled honestly — no filler, no
        charts.
      </p>

      <div className="grid gap-6">
        {groups.map((group, i) => (
          <SkillGroup key={group.category} group={group} index={i} />
        ))}
      </div>
    </Section>
  );
}
