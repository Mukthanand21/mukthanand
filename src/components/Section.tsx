import { type ReactNode } from 'react';
import { getChapterMeta, type SectionId } from '../motion/rackChapters';

type SectionProps = {
  id: string;
  label: string;
  title?: string;
  children?: ReactNode;
  className?: string;
  /** Override chapter scrim gradient */
  scrim?: string | null;
};

/* ─── Grain overlay texture (shared ambient layer) ─── */
const GRAIN_SVG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E";

/* ═══════════════════════════════════════════════════════
   Section — scroll chapter with scrim + entrance animation
   ═══════════════════════════════════════════════════════ */
export function Section({ id, label, title, children, className, scrim }: SectionProps) {
  const chapter = getChapterMeta(id as SectionId);
  const displayTitle = title ?? chapter?.title;
  const scrimGradient = scrim !== undefined ? scrim : (chapter?.scrim ?? null);

  return (
    <section
      id={id}
      className={`relative overflow-hidden py-section ${className ?? ''}`}
      style={{
        width: '100vw',
        marginLeft: 'calc(-50vw + 50%)',
        marginRight: 'calc(-50vw + 50%)',
      }}
    >
      {/* ─── Chapter scrim — legibility over global rack ─── */}
      {scrimGradient && (
        <div
          className="pointer-events-none absolute inset-0 z-[1]"
          style={{ background: scrimGradient }}
          aria-hidden="true"
        />
      )}

      {/* ─── Grain overlay ─── */}
      <div
        className="pointer-events-none absolute inset-0 z-[2]"
        style={{
          opacity: 0.025,
          backgroundImage: `url("${GRAIN_SVG}")`,
        }}
        aria-hidden="true"
      />

      {/* ─── Chapter bridge — gold hairline at section top ─── */}
      {id !== 'status' && (
        <div
          className="pointer-events-none absolute left-1/2 top-0 z-[3] h-px w-[min(320px,80vw)] -translate-x-1/2"
          style={{
            background: 'linear-gradient(90deg, transparent, var(--color-accent), transparent)',
            opacity: 0.45,
          }}
          aria-hidden="true"
        />
      )}

      <div className="relative z-10 mx-auto max-w-content px-gutter">
        <p className="mb-3 font-mono text-sm text-accent" data-section-label>
          {label}
        </p>

        {displayTitle && id !== 'status' && (
          <>
            <h2
              className="mb-4 font-sans text-[clamp(28px,4vw,40px)] font-semibold leading-[1.05] tracking-[-0.03em] text-fg"
              data-section-title
            >
              {displayTitle}
            </h2>
            <div
              className="mb-8 h-px w-12 bg-accent"
              data-section-accent-line
              aria-hidden="true"
            />
          </>
        )}

        {children}
      </div>
    </section>
  );
}
