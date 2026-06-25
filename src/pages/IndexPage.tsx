import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Status } from '../sections/Status';
import { Services } from '../sections/Services';
import { Changelog } from '../sections/Changelog';
import { Stack } from '../sections/Stack';
import { Contact } from '../sections/Contact';
import { RackScene } from '../components/RackScene';
import { useScrollSpy } from '../hooks/useScrollSpy';
import { useRackScrollDirector } from '../motion/useRackScrollDirector';
import { useContentAnimations } from '../motion/useContentAnimations';
import { useBootComplete } from '../components/Layout';

/* ─── Section IDs used by useScrollSpy and deep-linking ─── */
export const SECTION_IDS = ['status', 'services', 'changelog', 'stack', 'contact'] as const;
export type SectionId = (typeof SECTION_IDS)[number];


/* ═══════════════════════════════════════════════════════
   IndexPage — single-page scroll with global rack backdrop
   ═══════════════════════════════════════════════════════ */
export function IndexPage() {
  const bootComplete = useBootComplete();
  const activeSection = useScrollSpy(SECTION_IDS as unknown as string[], {
    rootMargin: '-40% 0px -40% 0px',
  });

  useRackScrollDirector({ bootComplete, sectionIds: [...SECTION_IDS] });
  useContentAnimations({ autoInitCards: bootComplete });

  const glowRef = useRef<HTMLDivElement>(null);
  const lastSection = useRef<string | null>(null);

  useEffect(() => {
    if (!glowRef.current || !activeSection || activeSection === lastSection.current) return;
    lastSection.current = activeSection;

    const el = document.getElementById(activeSection);
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const centerY = rect.top + rect.height / 2;
    const viewportCenter = window.innerHeight / 2;
    const offsetY = centerY - viewportCenter;

    gsap.to(glowRef.current, {
      y: offsetY * 0.12,
      duration: 1.4,
      ease: 'power2.out',
      overwrite: 'auto',
    });
  }, [activeSection]);

  return (
    <div data-page="index" data-active-section={activeSection ?? ''} className="relative">
      {/* ─── Global 3D rack — fixed viewport backdrop ─── */}
      <RackScene bootComplete={bootComplete} global />

      {/* ─── Site-wide ambient glow ─── */}
      <div
        ref={glowRef}
        id="ambient-glow"
        className="pointer-events-none fixed z-[1]"
        style={{
          top: '40%',
          left: '50%',
          width: 'min(90vw, 800px)',
          height: 'min(90vw, 800px)',
          transform: 'translate(-50%, -50%)',
          background:
            'radial-gradient(circle, rgba(245, 208, 112, 0.04) 0%, rgba(245, 208, 112, 0.015) 40%, transparent 70%)',
          opacity: activeSection ? 1 : 0,
          transition: 'opacity 1s cubic-bezier(0.16, 1, 0.3, 1)',
          willChange: 'transform, opacity',
        }}
        aria-hidden="true"
      />

      {/* ─── Scroll content above rack ─── */}
      <div className="relative z-[10]">
        <Status />
        <Services />
        <Changelog />
        <Stack />
        <Contact />
      </div>
    </div>
  );
}
