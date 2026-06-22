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
  link: LinkLabel | null;
  status: ServiceStatus;
  responseMs: number; // stable value for the decorative metrics footer
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
    responseMs: 87,
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
    responseMs: 142,
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
    responseMs: 205,
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
    responseMs: 0,
  },
];

/* ─── status dot + label ─── */
function StatusBadge({ status }: { status: ServiceStatus }) {
  const isLive = status === 'live';
  const color = isLive ? 'text-success' : 'text-fg-muted';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono text-xs ${color}`}
    >
      <span
        className={`inline-block h-1.5 w-1.5 rounded-full ${
          isLive ? 'bg-success animate-dot-pulse-service' : 'bg-fg-muted'
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
  const isArchived = service.status === 'archived';

  return (
    <Reveal delay={index * 0.08}>
      <article
        className={`group rounded-card border border-border border-l-[3px] bg-bg-elevated p-6 transition-all duration-150 sm:p-8 ${
          isArchived
            ? 'border-dashed border-l-border opacity-60'
            : 'border-l-transparent hover:-translate-y-1 hover:border-l-accent hover:bg-accent/[0.03] hover:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.5)]'
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
              <span className="inline-flex items-center gap-1">
                {service.link.label}
                <span className="inline-block transition-transform duration-150 group-hover:translate-x-0.5">
                  &rarr;
                </span>
              </span>
            </a>
          ) : (
            <span className="shrink-0 font-mono text-xs text-fg-muted">
              &mdash;
            </span>
          )}
        </div>

        {/* service name */}
        <h3 className="text-lg font-semibold text-fg transition-colors duration-150 group-hover:text-accent md:text-xl">
          {service.name}
        </h3>

        {/* description */}
        <p className="mt-3 max-w-prose text-sm leading-relaxed text-fg-secondary md:text-md">
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

        {/* system metrics footer — staggered fade-in */}
        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border pt-3 font-mono text-xs text-fg-muted/60">
          <span
            className="inline-flex items-center gap-1"
            style={{
              animation: isArchived ? 'none' : 'metricFadeIn 0.5s ease-out forwards',
              animationDelay: '0.45s',
              opacity: isArchived ? undefined : 0,
            }}
          >
            <span className="text-fg-muted/40">status:</span>
            <span className={isArchived ? 'text-fg-muted/40' : 'text-success/70'}>
              {isArchived ? '410 Gone' : '200 OK'}
            </span>
          </span>
          <span
            className="inline-flex items-center gap-1"
            style={{
              animation: isArchived ? 'none' : 'metricFadeIn 0.5s ease-out forwards',
              animationDelay: '0.55s',
              opacity: isArchived ? undefined : 0,
            }}
          >
            <span className="text-fg-muted/40">response:</span>
            <span>
              {isArchived ? '—' : `${service.responseMs}ms`}
            </span>
          </span>
          <span
            className="inline-flex items-center gap-1"
            style={{
              animation: isArchived ? 'none' : 'metricFadeIn 0.5s ease-out forwards',
              animationDelay: '0.65s',
              opacity: isArchived ? undefined : 0,
            }}
          >
            <span className="text-fg-muted/40">uptime:</span>
            <span>{isArchived ? '0d' : '142d'}</span>
          </span>
        </div>
      </article>
    </Reveal>
  );
}

/* ============================================================
   /services section — specs-v2/002-services.md
   Full-width cards, vertical list, projects as API services
   ============================================================ */
export function Services() {
  const liveCount = services.filter((s) => s.status === 'live').length;
  const archivedCount = services.filter((s) => s.status === 'archived').length;

  return (
    <>
      <style>{`
        .animate-dot-pulse-service {
          animation: serviceDotPulse 2.5s ease-in-out infinite;
        }
        @keyframes serviceDotPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.35; }
        }
        @keyframes metricFadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-dot-pulse-service {
            animation: none !important;
          }
        }
      `}</style>
      <Section id="services" label="/services">
      <div className="mb-10">
        <p className="max-w-prose text-base leading-relaxed text-fg-secondary">
          Services I&rsquo;ve shipped or contributed to.
        </p>
        <p className="mt-2 font-mono text-xs text-fg-muted">
          {services.length} services &middot; {liveCount} live &middot; {archivedCount} archived
        </p>
      </div>

      <div className="flex flex-col gap-5">
        {services.map((service, i) => (
          <ServiceCard key={service.name} service={service} index={i} />
        ))}
      </div>
    </Section>
    </>
  );
}
