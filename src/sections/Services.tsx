import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useMagneticTilt } from '../hooks/useMagneticTilt';
import { getChapterMeta } from '../motion/rackChapters';

gsap.registerPlugin(ScrollTrigger);

type ServiceStatus = 'live' | 'archived';
type LinkLabel = { href: string; label: string };

type PlatformIcon = {
  path: string;
  brandColor: string;
  viewBox?: string;
};

const PLATFORM_ICONS: Record<string, PlatformIcon> = {
  Telegram: {
    path: 'M23.91 3.79L20.3 20.84c-.25 1.21-.98 1.5-2 .94l-5.5-4.07-2.66 2.57c-.3.3-.55.56-1.1.56-.72 0-.6-.27-.84-.95L6.3 13.7l-5.45-1.7c-1.18-.35-1.19-1.16.26-1.75l21.26-8.2c.97-.43 1.9.24 1.53 1.73z',
    brandColor: '#0088CC',
  },
  Streamlit: {
    path: 'M16.673 11.32l6.862-3.618c.233-.136.554.12.442.387L20.463 17.1zm-8.556-.229l3.473-5.187c.203-.328.578-.316.793-.028l7.886 11.75zm-3.375 7.25c-.28 0-.835-.284-.993-.716l-3.72-9.46c-.118-.331.139-.614.48-.464l19.474 10.306c-.149.147-.453.337-.72.334z',
    brandColor: '#FF4B4B',
  },
  GitHub: {
    path: 'M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12',
    brandColor: '#333',
  },
  Search: {
    path: 'M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.35-4.35',
    brandColor: 'currentColor',
  },
};

function PlatformBadge({ platform }: { platform: string }) {
  const icon = PLATFORM_ICONS[platform];
  if (!icon) return null;

  return (
    <svg
      viewBox={icon.viewBox ?? '0 0 24 24'}
      className="mr-1 inline-block h-3.5 w-3.5 shrink-0 align-middle"
      fill={platform === 'Search' ? 'none' : icon.brandColor}
      stroke={platform === 'Search' ? icon.brandColor : 'none'}
      strokeWidth={platform === 'Search' ? 2 : 0}
      strokeLinecap={platform === 'Search' ? 'round' : undefined}
      strokeLinejoin={platform === 'Search' ? 'round' : undefined}
      aria-hidden="true"
    >
      <path d={icon.path} />
    </svg>
  );
}

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
  platform?: string;
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
    platform: 'Search',
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
    platform: 'Telegram',
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
    platform: 'Streamlit',
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
    platform: 'GitHub',
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
    <span className="group/badge relative inline-flex overflow-hidden rounded border border-border bg-bg px-2.5 py-0.5 font-mono font-light text-xs uppercase leading-none text-accent">
      <span className="relative z-[1]">{method}</span>
      <span className="absolute inset-0 scale-0 bg-accent/20 blur-xl transition-transform duration-500 group-hover/badge:scale-100" aria-hidden="true" />
    </span>
  );
}

function ServiceCard({ service }: { service: Service }) {
  const isArchived = service.status === 'archived';
  const tiltRef = useMagneticTilt<HTMLDivElement>();
  const glowColor = service.highlightColor ?? 'rgba(245, 208, 112, 0.06)';
  const [displayMs, setDisplayMs] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 50, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  // Animated response time counter
  useEffect(() => {
    if (isArchived) return;
    let frame = 0;
    const total = service.responseMs;
    const duration = 800;
    const increment = total / (duration / 16);
    
    const animate = () => {
      setDisplayMs(prev => {
        const next = prev + increment;
        if (next >= total) return total;
        frame = requestAnimationFrame(animate);
        return next;
      });
    };
    
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [isArchived, service.responseMs]);

  // Individual card scroll animation with text cascade
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: card,
          start: 'top 88%',
          toggleActions: 'play none none reverse',
        },
      });

      // 1. Card container
      tl.fromTo(
        card,
        {
          opacity: 0,
          y: prefersReduced ? 0 : 40,
          scale: prefersReduced ? 1 : 0.95,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.7,
          ease: 'cubic-bezier(0.16, 1, 0.3, 1)',
        }
      );

      if (!prefersReduced) {
        // 2. Header (method, path, status, link) - slide from left
        tl.fromTo(
          card.querySelector('.card-header'),
          { opacity: 0, x: -20 },
          { opacity: 1, x: 0, duration: 0.5, ease: 'cubic-bezier(0.16, 1, 0.3, 1)' },
          '-=0.4'
        );

        // 3. Title - fade + slight scale
        tl.fromTo(
          card.querySelector('.card-title'),
          { opacity: 0, scale: 0.98 },
          { opacity: 1, scale: 1, duration: 0.4, ease: 'cubic-bezier(0.16, 1, 0.3, 1)' },
          '-=0.3'
        );

        // 4. Description - line-by-line reveal (clip-path)
        tl.fromTo(
          card.querySelector('.card-description'),
          { opacity: 0, clipPath: 'inset(0 0 100% 0)' },
          { opacity: 1, clipPath: 'inset(0 0 0% 0)', duration: 0.6, ease: 'cubic-bezier(0.22, 1, 0.36, 1)' },
          '-=0.2'
        );

        // 5. Tech tags - stagger scale
        const techTags = card.querySelectorAll('.tech-tag');
        if (techTags.length > 0) {
          tl.fromTo(
            techTags,
            { opacity: 0, scale: 0.85, y: 8 },
            { 
              opacity: 1, 
              scale: 1, 
              y: 0,
              stagger: 0.04, 
              duration: 0.35,
              ease: 'cubic-bezier(0.16, 1, 0.3, 1)'
            },
            '-=0.3'
          );
        }

        // 6. Metadata - stagger from left
        const metaItems = card.querySelectorAll('.meta-item');
        if (metaItems.length > 0) {
          tl.fromTo(
            metaItems,
            { opacity: 0, x: -12 },
            { 
              opacity: 1, 
              x: 0,
              stagger: 0.08, 
              duration: 0.3,
              ease: 'cubic-bezier(0.16, 1, 0.3, 1)'
            },
            '-=0.2'
          );
        }
      }
    });

    return () => ctx.revert();
  }, []);

  // Track mouse position for parallax glow
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isArchived) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  return (
    <div ref={tiltRef} style={{ perspective: '800px' }} onMouseMove={handleMouseMove}>
      <article
        ref={cardRef}
        data-section-card
        className={`group relative rounded-card border bg-bg-elevated p-6 transition-all duration-300 sm:p-8 ${
          isArchived
            ? 'border-dashed border-border/60 opacity-60'
            : 'border-border/40 border-l-[3px] border-l-accent/15 hover:border-border hover:border-l-accent hover:bg-accent/[0.02] hover:shadow-[inset_0_1px_0_0_rgba(245,208,112,0.08)] sm:border-l-transparent'
        }`}
        style={{
          transformStyle: 'preserve-3d',
          transition: 'border-color 0.3s ease, background 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease',
        }}
      >
        {/* Animated border shimmer */}
        {!isArchived && (
          <div
            className="pointer-events-none absolute left-0 top-0 h-full w-[3px] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            style={{
              background: 'linear-gradient(180deg, transparent, var(--color-accent), transparent)',
              animation: 'shimmer 3s ease-in-out infinite',
            }}
            aria-hidden="true"
          />
        )}
        
        {/* Parallax glow overlay on hover */}
        {!isArchived && (
          <div
            className="pointer-events-none absolute inset-0 rounded-card opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            style={{
              background: `radial-gradient(ellipse at ${mousePos.x}% ${mousePos.y}%, ${glowColor} 0%, transparent 70%)`,
            }}
            aria-hidden="true"
          />
        )}

        <div className="relative z-[1]">
          <div className="card-header mb-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
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
                className="shrink-0 font-mono font-light text-xs text-fg-muted transition-colors duration-150 hover:text-accent sm:text-right"
                aria-label={service.link.label}
              >
                <span className="inline-flex items-center gap-1">
                  {service.platform && <PlatformBadge platform={service.platform} />}
                  {service.link.label}
                  <span className="inline-block transition-all duration-150 group-hover:translate-x-0.5 group-hover:rotate-[-8deg] group-hover:scale-110">
                    &rarr;
                  </span>
                </span>
              </a>
            ) : (
              <span className="shrink-0 font-mono font-light text-xs text-fg-muted sm:text-right">
                &mdash;
              </span>
            )}
          </div>

          <h3 className="card-title font-sans font-medium text-lg text-fg transition-colors duration-150 group-hover:text-accent md:text-xl">
            {service.name}
          </h3>

          <p className="card-description mt-3 max-w-prose font-sans font-light text-sm leading-relaxed text-fg-secondary md:text-md">
            {service.description}
          </p>

          {service.tech.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {service.tech.map((t) => (
                <span
                  key={t}
                  className="tech-tag rounded-full border border-border bg-bg-elevated px-3 py-1 font-mono font-light text-xs text-fg-muted transition-colors duration-150 group-hover:border-accent/20 group-hover:text-accent/70"
                >
                  {t}
                </span>
              ))}
            </div>
          )}

          <div className="mt-5 grid grid-cols-2 gap-y-2 sm:flex sm:flex-wrap items-center sm:gap-x-4 border-t border-border pt-3 font-mono font-light text-xs text-fg-muted/60">
            <span className="meta-item inline-flex items-center gap-1">
              <span className="text-fg-muted/40">status:</span>
              <span className={`font-medium ${isArchived ? 'text-fg-muted/40' : 'text-success/70'}`}>
                {isArchived ? '410 Gone' : '200 OK'}
              </span>
            </span>
            <span className="meta-item inline-flex items-center gap-1">
              <span className="text-fg-muted/40">response:</span>
              <span>
                {isArchived ? '—' : `${Math.round(displayMs)}ms`}
              </span>
            </span>
            <span className="meta-item inline-flex items-center gap-1">
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
  const containerRef = useRef<HTMLDivElement>(null);

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const chapter = getChapterMeta('services', isMobile);
  const scrimGradient = chapter?.scrim ?? 'linear-gradient(180deg, rgba(10,10,10,0.15) 0%, rgba(10,10,10,0.50) 45%, rgba(10,10,10,0.70) 100%)';

  useEffect(() => {
    if (!containerRef.current) return;

    const cards = containerRef.current.querySelectorAll('[data-section-card]');
    if (cards.length === 0) return;

    // Section-level animations are now handled per-card
    return () => {};
  }, []);

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
        @keyframes shimmer {
          0%, 100% { transform: translateY(-100%); }
          50% { transform: translateY(100%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-dot-pulse-service {
            animation: none !important;
          }
          [style*="animation: shimmer"] {
            animation: none !important;
          }
        }
      `}</style>
      <section
        id="services"
        className="relative overflow-hidden pt-12 pb-section sm:py-section"
        style={{
          width: '100vw',
          marginLeft: 'calc(-50vw + 50%)',
          marginRight: 'calc(-50vw + 50%)',
        }}
      >
        <div
          className="pointer-events-none absolute inset-0 z-[1]"
          style={{
            background: scrimGradient,
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

          <div ref={containerRef} className="flex flex-col gap-5">
            {services.map((service) => (
              <ServiceCard key={service.name} service={service} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
