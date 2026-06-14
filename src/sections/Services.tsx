import { Section } from '../components/Section';
import { Reveal } from '../motion/Reveal';

/* ─── project data ─── */
type Service = {
  method: string;
  path: string;
  name: string;
  description: string;
  tech: string[];
  href: string;
  label: string;
};

const services: Service[] = [
  {
    method: 'POST',
    path: '/query',
    name: 'Ask Your Corpus',
    description:
      'Contributed to a shared production RAG application — owned the Postgres-native retrieval layer using pgvector, eliminating the need for a separate vector database. Achieved sub-second retrieval with Bring-Your-Own-Key (BYOK) support.',
    tech: ['PostgreSQL', 'pgvector', 'Python', 'FastAPI'],
    href: '#',
    label: 'Live demo (Ask Your Corpus)',
  },
  /* ─── add more projects here ─── */
  // {
  //   method: 'GET',
  //   path: '/api',
  //   name: 'Your Project',
  //   description: 'One-line description of what this service does.',
  //   tech: ['Tech 1', 'Tech 2'],
  //   href: '#',
  //   label: 'View project',
  // },
];

/* ─── method badge ─── */
function MethodBadge({ method }: { method: string }) {
  const colors =
    method === 'POST'
      ? 'border-live/25 bg-live/10 text-live'
      : method === 'GET'
        ? 'border-accent/25 bg-accent/10 text-accent'
        : 'border-warning/25 bg-warning/10 text-warning';

  return (
    <span
      className={`inline-flex rounded-md border px-2.5 py-0.5 font-mono text-xs font-semibold uppercase ${colors}`}
    >
      {method}
    </span>
  );
}

/* ─── individual service card ─── */
function ServiceCard({ service, index }: { service: Service; index: number }) {
  return (
    <Reveal delay={index * 0.1}>
      <article className="group relative rounded-2xl border border-surface bg-bg-alt p-8 transition-all duration-500 hover:border-accent/20 hover:shadow-[0_0_40px_-8px_rgba(34,211,238,0.08)] sm:p-10">
        {/* card glow on hover */}
        <div className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-accent/[0.03] to-transparent" />
        </div>

        <div className="relative">
          {/* header row: method badge + path */}
          <div className="mb-5 flex items-center gap-3">
            <MethodBadge method={service.method} />
            <span className="font-mono text-sm text-fg-muted">
              {service.path}
            </span>
          </div>

          {/* project name */}
          <h3 className="mb-3 font-display text-heading text-fg-strong transition-colors duration-300 group-hover:text-accent">
            {service.name}
          </h3>

          {/* description */}
          <p className="mb-6 max-w-prose leading-relaxed text-fg-muted">
            {service.description}
          </p>

          {/* tech tags */}
          <div className="mb-6 flex flex-wrap gap-2">
            {service.tech.map((t) => (
              <span
                key={t}
                className="rounded-full border border-fg-faint/15 bg-surface/50 px-3 py-1 font-mono text-xs text-fg-faint"
              >
                {t}
              </span>
            ))}
          </div>

          {/* link */}
          <a
            href={service.href}
            className="group/link inline-flex items-center gap-2 font-mono text-sm text-accent transition-opacity duration-300 hover:opacity-70"
            aria-label={service.label}
          >
            <span>View project</span>
            <span className="inline-block transition-transform duration-300 group-hover/link:translate-x-1">
              &rarr;
            </span>
          </a>
        </div>
      </article>
    </Reveal>
  );
}

/* ============================================================
   /services section
   ============================================================ */
export function Services() {
  return (
    <Section id="services" label="/services">
      <div className="grid gap-8">
        {services.map((service, i) => (
          <ServiceCard key={service.name} service={service} index={i} />
        ))}
      </div>
    </Section>
  );
}
