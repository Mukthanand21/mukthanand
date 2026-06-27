import { useMagneticTilt } from '../hooks/useMagneticTilt';

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
  responseMs: number;
  highlightColor?: string;
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
    highlightColor: 'rgba(245, 208, 112, 0.06)',
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
    highlightColor: 'rgba(168, 195, 160, 0.06)',
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
    highlightColor: 'rgba(168, 195, 160, 0.06)',
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
    highlightColor: 'rgba(107, 77, 107, 0.04)',
  },
];

function StatusBadge({ status }: { status: ServiceStatus }) {
  const isLive = status === 'live';
  const color = isLive ? 'text-success' : 'text-fg-muted';

  return (
    <span className={`inline-flex items-center gap-1.5 font-mono font-light text-xs ${color}`}>
      <span
        className={`inline-block h-1.5 w-1.5 rounded-full ${isLive ? 'bg-success animate-dot-pulse-service' : 'bg-fg-muted'
          }`}
      />
      <span className="uppercase tracking-wider">{status}</span>
    </span>
  );
}

function MethodBadge({ method }: { method: string }) {
  return (
    <span className="inline-flex rounded border border-border bg-bg px-2.5 py-0.5 font-mono font-light text-xs uppercase leading-none text-accent">
      {method}
    </span>
  );
}

function ServiceCard({ service }: { service: Service }) {
  const isArchived = service.status === 'archived';
  const tiltRef = useMagneticTilt<HTMLDivElement>();
  const glowColor = service.highlightColor ?? 'rgba(245, 208, 112, 0.06)';

  return (
    <div ref={tiltRef} style={{ perspective: '800px' }}>
      <article
        data-section-card
        className={`group relative rounded-card border border-border border-l-[3px] bg-bg-elevated p-6 transition-all duration-300 sm:p-8 ${isArchived
            ? 'border-dashed border-l-border opacity-60'
            : 'border-l-transparent hover:border-l-accent hover:bg-accent/[0.02]'
          }`}
        style={{
          transformStyle: 'preserve-3d',
          transition: 'border-color 0.3s ease, background 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease',
        }}
      >
        {/* Glow overlay on hover */}
        {!isArchived && (
          <div
            className="pointer-events-none absolute inset-0 rounded-card opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            style={{
              background: `radial-gradient(ellipse at 50% 0%, ${glowColor} 0%, transparent 70%)`,
            }}
            aria-hidden="true"
          />
        )}

        <div className="relative z-[1]">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2.5">
              <MethodBadge method={service.method} />
              <span className="font-mono font-light text-sm text-fg-muted">
                {service.path}
              </span>
              <StatusBadge status={service.status} />
            </div>

            {service.link ? (
              <a
                href={service.link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 font-mono font-light text-xs text-fg-muted transition-colors duration-150 hover:text-accent"
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
              <span className="shrink-0 font-mono font-light text-xs text-fg-muted">
                &mdash;
              </span>
            )}
          </div>

          <h3 className="font-sans font-medium text-lg text-fg transition-colors duration-150 group-hover:text-accent md:text-xl">
            {service.name}
          </h3>

          <p className="mt-3 max-w-prose font-sans font-light text-sm leading-relaxed text-fg-secondary md:text-md">
            {service.description}
          </p>

          {service.tech.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {service.tech.map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-border bg-bg-elevated px-3 py-1 font-mono font-light text-xs text-fg-muted transition-colors duration-150 group-hover:border-accent/20 group-hover:text-accent/70"
                >
                  {t}
                </span>
              ))}
            </div>
          )}

          <div className="mt-5 grid grid-cols-2 gap-y-2 sm:flex sm:flex-wrap items-center sm:gap-x-4 border-t border-border pt-3 font-mono font-light text-xs text-fg-muted/60">
            <span className="inline-flex items-center gap-1">
              <span className="text-fg-muted/40">status:</span>
              <span className={`font-medium ${isArchived ? 'text-fg-muted/40' : 'text-success/70'}`}>
                {isArchived ? '410 Gone' : '200 OK'}
              </span>
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="text-fg-muted/40">response:</span>
              <span>
                {isArchived ? '—' : `${service.responseMs}ms`}
              </span>
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="text-fg-muted/40">uptime:</span>
              <span className="font-medium">{isArchived ? '0d' : '142d'}</span>
            </span>
          </div>
        </div>
      </article>
    </div>
  );
}

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
        @media (prefers-reduced-motion: reduce) {
          .animate-dot-pulse-service {
            animation: none !important;
          }
        }
      `}</style>
      <section
        id="services"
        className="relative overflow-hidden py-section"
        style={{
          width: '100vw',
          marginLeft: 'calc(-50vw + 50%)',
          marginRight: 'calc(-50vw + 50%)',
        }}
      >
        <div
          className="pointer-events-none absolute inset-0 z-[1]"
          style={{
            background:
              'linear-gradient(180deg, rgba(10,10,10,0.72) 0%, rgba(10,10,10,0.88) 35%, rgba(10,10,10,0.94) 100%)',
          }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-0 z-[2]"
          style={{
            opacity: 0.025,
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute left-1/2 top-0 z-[3] h-px w-[min(320px,80vw)] -translate-x-1/2"
          style={{
            background: 'linear-gradient(90deg, transparent, var(--color-accent), transparent)',
            opacity: 0.45,
          }}
          aria-hidden="true"
        />
        <div className="relative z-10 mx-auto max-w-content px-gutter">
          <p className="mb-3 font-mono text-sm text-accent" data-section-label>
            /services
          </p>
          <h2
            className="mb-4 font-sans text-[clamp(28px,4vw,40px)] font-bold leading-[1.05] tracking-[-0.03em] text-fg"
            data-section-title
          >
            Selected Work
          </h2>
          <div
            className="mb-8 h-px w-12 bg-accent"
            data-section-accent-line
            aria-hidden="true"
          />
          <div className="mb-10">
            <p className="max-w-prose text-base leading-relaxed text-fg-secondary" data-section-desc>
              Services I&rsquo;ve shipped or contributed to.
            </p>
            <p className="mt-2 font-mono text-xs text-fg-muted" data-section-meta>
              {services.length} services &middot; {liveCount} live &middot; {archivedCount} archived
            </p>
          </div>

          <div className="flex flex-col gap-5">
            {services.map((service) => (
              <ServiceCard key={service.name} service={service} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
