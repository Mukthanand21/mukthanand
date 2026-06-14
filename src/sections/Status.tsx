import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useRef, type ReactNode, type RefObject } from 'react';
import { Link } from 'react-router-dom';
import { Section } from '../components/Section';
import { Reveal } from '../motion/Reveal';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

/* ─── animated green live dot ─── */
function LiveDot() {
  const reduced = usePrefersReducedMotion();
  return (
    <span className="relative flex h-2.5 w-2.5">
      {!reduced && (
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-live/75" />
      )}
      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-live" />
    </span>
  );
}

/* ─── cursor-following cyan glow ─── */
function CursorGlow({ containerRef }: { containerRef: RefObject<HTMLDivElement | null> }) {
  const reduced = usePrefersReducedMotion();
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 80, damping: 25 });
  const springY = useSpring(mouseY, { stiffness: 80, damping: 25 });

  const handleMove = (e: React.MouseEvent) => {
    if (reduced) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      mouseX.set(e.clientX - rect.left);
      mouseY.set(e.clientY - rect.top);
    }
  };

  if (reduced) return null;

  return (
    <div
      className="absolute inset-0 -z-10 overflow-hidden"
      onMouseMove={handleMove}
    >
      <motion.div
        className="pointer-events-none absolute h-80 w-80 rounded-full bg-accent/8 blur-[150px]"
        style={{
          left: springX,
          top: springY,
          translateX: '-50%',
          translateY: '-50%',
        }}
      />
    </div>
  );
}

/* ─── nav link with underline animation ─── */
function HeroNavLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      className="group relative font-mono text-sm text-fg-muted transition-colors duration-300 hover:text-accent"
    >
      <span className="inline-block transition-transform duration-300 group-hover:-translate-y-0.5">
        {children}
      </span>
      <span className="absolute -bottom-1 left-0 h-px w-0 bg-accent transition-all duration-300 group-hover:w-full" />
    </Link>
  );
}

/* ============================================================
   /status hero section
   ============================================================ */
export function Status() {
  const sectionRef = useRef<HTMLDivElement>(null);

  return (
    <Section id="status" label="/status">
      <div
        ref={sectionRef}
        className="relative flex min-h-[80vh] flex-col justify-center"
      >
        {/* cursor-sensitive cyan glow */}
        <CursorGlow containerRef={sectionRef} />

        {/* positioning line */}
        <Reveal>
          <p className="mb-4 font-mono text-sm uppercase tracking-widest text-fg-muted">
            Software Engineer
          </p>
        </Reveal>

        {/* oversized Clash Display name — spring entrance */}
        <Reveal delay={0.1}>
          <h1 className="font-display text-display-1 text-fg-strong">
            Mukthanand&nbsp;Reddy
          </h1>
        </Reveal>

        {/* status bar: availability + version */}
        <Reveal delay={0.2}>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            {/* availability — green live dot */}
            <span className="flex items-center gap-2 font-mono text-sm text-fg">
              <LiveDot />
              <span>
                Open to Software, AI &amp; Full-Stack Opportunities
              </span>
            </span>

            {/* version badge — violet mono */}
            <span className="rounded-full border border-version/20 px-3.5 py-1 font-mono text-xs text-version">
              v2.0.0&nbsp;— Graduation Release
            </span>
          </div>
        </Reveal>

        {/* human-readable subline */}
        <Reveal delay={0.3}>
          <p className="mt-10 max-w-2xl text-lg leading-relaxed text-fg-muted">
            Building AI-powered applications, scalable backend services,
            and full-stack products focused on reliability, performance,
            and real-world impact.
          </p>
        </Reveal>

        {/* clear nav to other sections */}
        <Reveal delay={0.4}>
          <nav className="mt-14 flex flex-wrap gap-x-10 gap-y-3">
            <HeroNavLink to="/services">View projects</HeroNavLink>
            <HeroNavLink to="/changelog">Experience</HeroNavLink>
            <HeroNavLink to="/stack">Skills</HeroNavLink>
            <HeroNavLink to="/contact">Get in touch</HeroNavLink>
          </nav>
        </Reveal>
      </div>
    </Section>
  );
}
