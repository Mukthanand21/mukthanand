import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Section } from '../components/Section';
import { SkillIcon } from '../components/SkillIcon';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { useMagneticTilt } from '../hooks/useMagneticTilt';

gsap.registerPlugin(ScrollTrigger);

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
      { name: 'JavaScript', level: 'strong', note: 'React frontends, scripts' },
      { name: 'Java', level: 'familiar', note: 'Academic, DSA' },
      { name: 'C', level: 'familiar', note: 'Systems coursework' },
    ],
  },
  {
    id: 'databases',
    label: 'DATABASES',
    items: [
      { name: 'PostgreSQL', level: 'strongest', note: 'RAG retrieval, EHRS, migrations' },
      { name: 'SQL', level: 'strong', note: 'Complex queries, data modeling' },
      { name: 'MySQL', level: 'familiar', note: 'Academic projects, basics' },
    ],
  },
  {
    id: 'backend',
    label: 'BACKEND',
    items: [
      { name: 'FastAPI', level: 'strongest', note: '3 production backends' },
      { name: 'Flask', level: 'strong', note: 'MediFlow AI, early projects' },
      { name: 'REST API Design', level: 'strong', note: 'Endpoint design, RBAC, versioning' },
    ],
  },
  {
    id: 'frontend',
    label: 'FRONTEND',
    items: [
      { name: 'React', level: 'strong', note: 'Corpus client, EHRS frontend' },
      { name: 'Tailwind CSS', level: 'strong', note: 'Component styling' },
      { name: 'HTML/CSS', level: 'strong', note: 'Semantic markup, accessibility' },
    ],
  },
  {
    id: 'devops',
    label: 'DEVOPS & TOOLS',
    items: [
      { name: 'AWS', level: 'strong', note: 'Academy Graduate. Cloud architectures, IAM, Lambda, S3, RDS.' },
      { name: 'Git', level: 'strong', note: 'Rebase, force-with-lease, protected branches' },
      { name: 'GitLab CI/CD', level: 'strong', note: 'Pipelines, Docker-based CI, Pages deploy' },
      { name: 'Linux (Ubuntu)', level: 'strong', note: 'Daily driver, VM tuning, kernel modules' },
      { name: 'Docker', level: 'familiar', note: 'Containerisation basics, CI usage' },
      { name: 'Bruno', level: 'strong', note: 'API testing, collection management' },
    ],
  },
  {
    id: 'ai-ml',
    label: 'AI & ML',
    items: [
      { name: 'Agentic AI / Skills', level: 'strong', note: 'Custom skill creation, Viswam AI' },
      { name: 'RAG Pipelines', level: 'strong', note: 'Hybrid FTS + pg_trgm, BYOK LLM' },
      { name: 'Groq / LLM APIs', level: 'strong', note: 'BYOK architecture, multi-provider' },
      { name: 'Prompt Engineering', level: 'strong', note: 'Structured outputs, agent skills' },
    ],
  },
];

/* ─── credential data ─── */
type Credential = {
  issuer: string;
  title: string;
  description: string;
  pdfUrl: string;
  caId: string;
  iconName: string;
  skills: string[];
};

const CREDENTIALS: Credential[] = [
  {
    issuer: 'AWS ACADEMY',
    title: 'AWS Cloud Practitioner & Developer',
    description:
      'Cloud infrastructure architectures, IAM policies, serverless Lambda integration, Amazon S3 storage bucket configuration, and RDS PostgreSQL deployments.',
    pdfUrl: '/AWS_Academy_Graduate.pdf',
    caId: 'AWS-DEC-2025',
    iconName: 'AWS',
    skills: ['IAM', 'Lambda', 'S3', 'RDS', 'Cloud Architecture'],
  },
  {
    issuer: 'COURSERA / META',
    title: 'Meta Front-End Developer',
    description:
      'Advanced single-page React applications, UI state management models, accessibility guidelines (WCAG), CSS grid/flex layouts, and testing suites.',
    pdfUrl: '/Coursera_Frontend_Certificate.pdf',
    caId: 'SEP-2024',
    iconName: 'Coursera',
    skills: ['React', 'State Management', 'WCAG', 'CSS Grid/Flex', 'Testing'],
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
      className={`group rounded-card border-thin border-border p-4 transition-[background,border-color] duration-150 hover:border-accent/15 hover:shadow-[0_0_20px_-10px_rgba(232,182,90,0.05)] ${featured
          ? 'bg-[rgba(245,208,112,0.035)] shadow-[0_0_24px_-16px_rgba(232,182,90,0.08)]'
          : 'bg-bg-subtle'
        }`}
    >
      {/* proficiency blocks + gold diamond for strongest */}
      <div className="mb-1.5 flex items-center gap-1.5">
        <span className={`font-mono font-light text-[10px] uppercase tracking-[0.12em] ${meta.color}`}>
          {meta.blocks}
        </span>
        {featured && (
          <span className="font-sans text-[9px] text-accent opacity-70" aria-label="Strongest proficiency">
            &#9670;
          </span>
        )}
      </div>

      {/* skill name + icon */}
      <div
        className={`mb-1 flex items-center gap-1.5 font-sans font-medium text-fg transition-colors duration-150 group-hover:text-accent ${featured ? 'text-[17px]' : 'text-[14px]'
          }`}
      >
        <SkillIcon name={skill.name} />
        {skill.name}
      </div>

      {/* note + optional external link */}
      <div className="flex items-start justify-between gap-3">
        <div className="font-sans font-light text-xs leading-relaxed text-fg-secondary">
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
              <path d="M21 13v10h-21v-19h12v2h-10v15h17v-8h2zm3-12h-9.988l4.365 4.366-9.502 9.502 1.658 1.658 9.502-9.502 4.26 4.259.013-10.283h-.308z" />
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
      className={`relative rounded-full border border-border px-4 py-1.5 font-mono text-[9px] uppercase tracking-[0.1em] transition-all duration-150 ${active
          ? 'border-accent/30 bg-accent/[0.04] text-accent opacity-100'
          : 'bg-bg-elevated text-fg-muted hover:text-fg hover:bg-bg-subtle hover:border-border opacity-70 hover:opacity-100'
        }`}
    >
      {label}
    </button>
  );
}

/* ============================================================
   /stack section
   Tab-navigated discipline groups with featured skill cards
   ============================================================ */
export function Stack() {
  const [activeTab, setActiveTab] = useState(groups[0].id);
  const [hasScrolledTo, setHasScrolledTo] = useState(false);
  const currentGroup = groups.find((g) => g.id === activeTab)!;

  /* ─── Delay card render until section scrolls into view ─── */
  useEffect(() => {
    if (hasScrolledTo) return;
    const el = document.getElementById('stack');
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasScrolledTo(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasScrolledTo]);

  return (
    <Section id="stack" label="/stack">
      <div className="mb-6">
        <p
          className="max-w-prose font-sans text-base leading-relaxed text-fg-secondary"
          data-section-desc
        >
          Skills grouped by discipline. Depth signaled honestly — no filler, no charts.
        </p>
        <p
          className="mt-2 font-mono text-xs text-fg-muted"
          data-section-meta
          key={currentGroup.id}
        >
          {currentGroup.items.length} skills &middot;{' '}
          {currentGroup.items.filter((s) => s.level === 'strongest').length} strongest &middot;{' '}
          {currentGroup.items.filter((s) => s.level === 'familiar').length} familiar
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

      {/* active tab panel — AnimatePresence for smooth tab switch transitions */}
      <AnimatePresence mode="wait">
        {hasScrolledTo && (
          <motion.div
            key={currentGroup.id}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15, ease: 'easeInOut' }}
          >
            <TabPanel group={currentGroup} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Systems Cryptographic Credentials ─── */}
      <div className="mt-14 border-t border-border/20 pt-8">
        <div className="mb-6 flex items-center gap-3" data-cred-header>
          <span className="font-mono text-xs uppercase tracking-[0.12em] text-accent">
            SYSTEM / CREDENTIALS
          </span>
          <div className="h-px flex-1 bg-gradient-to-r from-accent/30 to-transparent" aria-hidden="true" />
        </div>
        <CredentialsPanel />
      </div>
    </Section>
  );
}

/* ─── CredentialsPanel — cards now handle their own entrance via per-element GSAP cascade ─── */
function CredentialsPanel() {
  return (
    <>
      <style>{`
        @keyframes cred-shimmer {
          0%, 100% { transform: translateY(-100%); }
          50% { transform: translateY(100%); }
        }
        .cred-card-active .cred-card-title {
          color: var(--color-accent) !important;
        }
        @media (prefers-reduced-motion: reduce) {
          [style*="animation: cred-shimmer"] {
            animation: none !important;
          }
        }
      `}</style>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {CREDENTIALS.map((cred) => (
          <CredentialCard key={cred.caId} credential={cred} />
        ))}
      </div>
    </>
  );
}

/* ─── CredentialCard — full-card link with shimmer, per-element GSAP cascade, scroll-focus ─── */
function CredentialCard({
  credential,
}: {
  credential: Credential;
}) {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const reduced = usePrefersReducedMotion();

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (reduced) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  /* ─── Per-card GSAP entrance cascade + scroll-focus ─── */
  useEffect(() => {
    if (reduced) return;
    const card = cardRef.current;
    if (!card) return;

    const ctx = gsap.context(() => {
      /* set initial hidden state */
      gsap.set(card, { opacity: 0, y: 28, scale: 0.96 });

      /* scroll-focus active state — brightens title when in viewport center */
      ScrollTrigger.create({
        trigger: card,
        start: 'top 65%',
        end: 'bottom 35%',
        onEnter: () => card.classList.add('cred-card-active'),
        onLeave: () => card.classList.remove('cred-card-active'),
        onEnterBack: () => card.classList.add('cred-card-active'),
        onLeaveBack: () => card.classList.remove('cred-card-active'),
      });

      /* per-element cascade timeline */
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: card,
          start: 'top 88%',
          toggleActions: 'play none none reverse',
        },
      });

      // 1. Card container entrance
      tl.to(card, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.7,
        ease: 'cubic-bezier(0.16, 1, 0.3, 1)',
      });

      // 2. Icon + Title — slide from left
      const iconEl = card.querySelector('[data-cred-icon]');
      const titleEl = card.querySelector('[data-cred-title]');
      if (iconEl && titleEl) {
        tl.fromTo(
          [iconEl, titleEl],
          { opacity: 0, x: -16 },
          {
            opacity: 1,
            x: 0,
            duration: 0.5,
            ease: 'cubic-bezier(0.16, 1, 0.3, 1)',
          },
          '-=0.4',
        );
      }

      // 3. Description — fade + slide up
      const descEl = card.querySelector('[data-cred-desc]');
      if (descEl) {
        tl.fromTo(
          descEl,
          { opacity: 0, y: 12 },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: 'cubic-bezier(0.16, 1, 0.3, 1)',
          },
          '-=0.3',
        );
      }

      // 4. Skill tags — stagger scale
      const tagsEl = card.querySelector('[data-cred-tags]');
      if (tagsEl) {
        const tagSpans = tagsEl.querySelectorAll('span');
        if (tagSpans.length > 0) {
          tl.fromTo(
            tagSpans,
            { opacity: 0, scale: 0.85, y: 8 },
            {
              opacity: 1,
              scale: 1,
              y: 0,
              stagger: 0.04,
              duration: 0.35,
              ease: 'cubic-bezier(0.16, 1, 0.3, 1)',
            },
            '-=0.3',
          );
        }
      }


    });

    return () => ctx.revert();
  }, [reduced]);

  return (
    <a
      ref={cardRef}
      href={credential.pdfUrl}
      target="_blank"
      rel="noopener noreferrer"
      data-cred-card
      onMouseMove={handleMouseMove}
      className="group relative block overflow-hidden rounded-card border border-border/50 bg-[rgba(17,17,17,0.55)] p-5 transition-all duration-500 hover:border-accent/15 hover:shadow-[inset_0_1px_0_0_rgba(245,208,112,0.08)] sm:p-6"
      style={{
        perspective: '800px',
        transformStyle: 'preserve-3d',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      } as React.CSSProperties}
    >
      {/* ─── Animated gold shimmer accent bar ─── */}
      <div
        className="pointer-events-none absolute left-0 top-0 h-full w-[3px] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            'linear-gradient(180deg, transparent, var(--color-accent), transparent)',
          animation: 'cred-shimmer 3s ease-in-out infinite',
        }}
        aria-hidden="true"
      />

      {/* ─── Mouse-following parallax glow ─── */}
      {!reduced && (
        <div
          className="pointer-events-none absolute inset-0 rounded-card opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background: `radial-gradient(ellipse at ${mousePos.x}% ${mousePos.y}%, rgba(245, 208, 112, 0.08) 0%, transparent 70%)`,
          }}
          aria-hidden="true"
        />
      )}

      {/* ─── Corner gradient overlay on hover ─── */}
      <div
        className="pointer-events-none absolute inset-0 rounded-card opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            'linear-gradient(135deg, rgba(245, 208, 112, 0.06) 0%, transparent 40%, transparent 60%, rgba(245, 208, 112, 0.03) 100%)',
        }}
        aria-hidden="true"
      />

      {/* ─── Top row: issuer badge + CA_ID ─── */}
      <div className="relative z-[1] mb-3.5 flex items-center justify-between">
        <span className="rounded-full border border-border bg-bg-elevated px-3 py-1 font-mono text-[10px] text-fg-muted transition-colors duration-200 group-hover:border-accent/20 group-hover:text-accent/70">
          {credential.issuer}
        </span>
        <span className="font-mono text-[9px] tracking-wider text-fg-muted/50">
          {credential.caId}
        </span>
      </div>

      {/* ─── Icon + Title ─── */}
      <div data-cred-icon className="relative z-[1] mb-3 flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-bg-elevated/40 transition-all duration-300 group-hover:bg-accent/[0.06]">
          <SkillIcon name={credential.iconName} />
        </div>
        <h4
          data-cred-title
          className="cred-card-title font-sans font-medium text-[15px] leading-snug text-fg transition-colors duration-300 group-hover:text-accent"
        >
          {credential.title}
        </h4>
      </div>

      {/* ─── Description ─── */}
      <p data-cred-desc className="relative z-[1] mb-4 font-sans font-light text-xs leading-relaxed text-fg-secondary">
        {credential.description}
      </p>

      {/* ─── Skill tags ─── */}
      {credential.skills.length > 0 && (
        <div data-cred-tags className="relative z-[1] mb-5 flex flex-wrap gap-1.5">
          {credential.skills.map((skill) => (
            <span
              key={skill}
              className="rounded-full border border-border bg-bg-elevated px-3 py-1 font-mono text-[10px] text-fg-muted transition-colors duration-200 group-hover:border-accent/20 group-hover:text-accent/70"
            >
              {skill}
            </span>
          ))}
        </div>
      )}


    </a>
  );
}
