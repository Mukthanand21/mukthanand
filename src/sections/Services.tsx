import { Section } from '../components/Section';
import { Reveal } from '../motion/Reveal';

/* ─── service data — placeholder until #16 ─── */
type ServiceStatus = 'live' | 'archived';
type LinkLabel = { href: string; label: string };

type Service = {
  method: string;
  path: string;
  name: string;
  description: string;
  tech: string[];
  link: LinkLabel | null; // null for archived services with no link
  status: ServiceStatus;
};

const services: Service[] = [
  {
    method: 'POST',
    path: '/retrieve',
    name: 'Ask Your Corpus',
    description:
      'Built the RAG system for Corpus, a 10k+ user open-source platform. Designed PostgreSQL-native hybrid retrieval (FTS + pg_trgm) with 92% top-1 accuracy, 50–200 ms scan times, and a BYOK architecture supporting multiple LLM providers.',
    tech: ['PostgreSQL', 'pg_trgm', 'FastAPI', 'Python', 'React', 'TypeScript'],
    link: { href: 'https://corpus.swecha.org', label: 'corpus.swecha.org' },
    status: 'live',
  },
  {
    method: 'POST',
    path: '/chat',
    name: 'Scheme Saathi',
    description:
      'Built at a 48hr hackathon, a Telugu-first Telegram bot helping Telangana SMB owners discover government schemes, check eligibility, and get document guidance in their native language. Added voice input (STT) and voice output (TTS) using Groq API.',
    tech: ['Python', 'Telegram Bot API', 'Groq', 'STT', 'TTS', 'Telugu NLP'],
    link: { href: 'https://t.me/scheme_saathi_bot', label: '@scheme_saathi_bot' },
    status: 'live',
  },
  {
    method: 'GET',
    path: '/faq',
    name: 'FAQ Sense',
    description:
      'Semantic FAQ search assistant built during a hackathon at Viswam AI. Uses Sentence-Transformers for embeddings, FAISS for vector search, and Groq API for answer generation. Deployed on Streamlit Cloud.',
    tech: ['Python', 'Sentence-Transformers', 'FAISS', 'Groq', 'Streamlit'],
    link: {
      href: 'https://faqsense.streamlit.app',
      label: 'faqsense.streamlit.app',
    },
    status: 'live',
  },
  {
    method: 'GET',
    path: '/pharmacy',
    name: 'MediFlow AI',
    description:
      'Full-stack pharmacy management system with AI sales prediction. Built with Flask (backend), PostgreSQL (database), and Tailwind CSS (frontend). Includes a Linear Regression ML model to forecast medicine sales and inventory needs.',
    tech: ['Python', 'Flask', 'PostgreSQL', 'Tailwind CSS', 'Machine Learning', 'Linear Regression'],
    link: { href: 'https://github.com/Mukthanand21/MediFlow.ai', label: 'github.com/Mukthanand21/MediFlow.ai' },
    status: 'archived',
  },
];

/* ─── status dot + label ─── */
function StatusBadge({ status }: { status: ServiceStatus }) {
  const color =
    status === 'live'
      ? 'text-success'
      : 'text-fg-muted';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono text-xs ${color}`}
    >
      <span
        className={`inline-block h-1.5 w-1.5 rounded-full ${
          status === 'live' ? 'bg-success' : 'bg-fg-muted'
        }`}
      />
      <span className="uppercase tracking-wider">{status}</span>
    </span>
  );
}

/* ─── method badge ─── */
function MethodBadge({ method }: { method: string }) {
  return (
    <span className="inline-flex rounded border border-border bg-bg px-2.5 py-0.5 font-mono text-xs uppercase leading-none text-accent">
      {method}
    </span>
  );
}

/* ─── individual service card ─── */
function ServiceCard({ service, index }: { service: Service; index: number }) {
  return (
    <Reveal delay={index * 0.08}>
      <article
        className={`group rounded-card border border-border bg-bg-elevated p-6 transition-all duration-150 hover:border-bg-subtle hover:bg-[#453050] sm:p-8 ${
          service.status === 'archived' ? 'opacity-70' : ''
        }`}
      >
        {/* header row: method + path + status (left) · link (right) */}
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <MethodBadge method={service.method} />
            <span className="font-mono text-sm text-fg-muted">
              {service.path}
            </span>
            <StatusBadge status={service.status} />
          </div>

          {/* top-right link */}
          {service.link ? (
            <a
              href={service.link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 font-mono text-xs text-fg-muted transition-colors duration-150 hover:text-accent"
              aria-label={service.link.label}
            >
              {service.link.label} &rarr;
            </a>
          ) : (
            <span className="shrink-0 font-mono text-xs text-fg-muted">
              &mdash;
            </span>
          )}
        </div>

        {/* service name */}
        <h3 className="text-xl font-semibold text-fg transition-colors duration-150 group-hover:text-accent">
          {service.name}
        </h3>

        {/* description */}
        <p className="mt-3 max-w-prose text-md leading-relaxed text-fg-secondary">
          {service.description}
        </p>

        {/* tech tags */}
        {service.tech.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {service.tech.map((t) => (
              <span
                key={t}
                className="rounded-full border border-border bg-bg-elevated px-3 py-1 font-mono text-xs text-fg-muted"
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </article>
    </Reveal>
  );
}

/* ============================================================
   /services section — specs-v2/002-services.md
   Full-width cards, vertical list, projects as API services
   ============================================================ */
export function Services() {
  return (
    <Section id="services" label="/services">
      <p className="mb-10 max-w-prose text-base leading-relaxed text-fg-secondary">
        Services I&rsquo;ve shipped or contributed to.
      </p>

      <div className="flex flex-col gap-5">
        {services.map((service, i) => (
          <ServiceCard key={service.name} service={service} index={i} />
        ))}
      </div>
    </Section>
  );
}
