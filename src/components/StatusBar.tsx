/* ═══════════════════════════════════════════════════════
   StatusBar — system-style status bar
   On desktop: static horizontal bar with spread items.
   On mobile: auto-scrolling ticker-like animation.
   ═══════════════════════════════════════════════════════ */

import { useEffect, useRef, useState, forwardRef } from 'react';
import gsap from 'gsap';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

/* ─── Render the status items as flat JSX ─── */
function StatusItems({ id, uptime }: { id?: string; uptime: string }) {
  return (
    <>
      {/* status — success LED + uppercase label */}
      <span className="inline-flex items-center gap-2 shrink-0 pr-4">
        <span
          className="block h-1.5 w-1.5 rounded-full bg-success animate-led-pulse"
          style={{ boxShadow: '0 0 6px var(--color-success)' }}
        />
        <span className="font-sans text-xs font-semibold uppercase tracking-wider text-success">
          online
        </span>
      </span>

      {/* divider */}
      <span className="h-3.5 w-[0.5px] bg-border inline-block shrink-0 mr-4" />

      {/* build */}
      <span className="inline-flex items-center gap-1.5 shrink-0 pr-4">
        <span className="font-sans text-xs text-fg-muted uppercase">build</span>
        <span className="font-mono text-xs text-fg-secondary font-medium transition-all duration-500 ease-brand">
          v3.0.0
        </span>
      </span>

      {/* divider */}
      <span className="h-3.5 w-[0.5px] bg-border inline-block shrink-0 mr-4" />

      {/* uptime */}
      <span className="inline-flex items-center gap-1.5 shrink-0 pr-4">
        <span className="font-sans text-xs text-fg-muted uppercase">uptime</span>
        <span
          id={id ? `${id}-uptime` : undefined}
          className="font-mono text-xs text-fg-secondary font-medium transition-all duration-500 ease-brand"
        >
          {uptime || '0d 00:00:00'}
        </span>
      </span>

      {/* divider */}
      <span className="h-3.5 w-[0.5px] bg-border inline-block shrink-0 mr-4" />

      {/* region */}
      <span className="inline-flex items-center gap-1.5 shrink-0 pr-4">
        <span className="font-sans text-xs text-fg-muted uppercase">region</span>
        <span className="font-mono text-xs text-fg-secondary font-medium transition-all duration-500 ease-brand">
          IND Hyd
        </span>
      </span>

      {/* divider */}
      <span className="h-3.5 w-[0.5px] bg-border inline-block shrink-0 mr-4" />

      {/* load */}
      <span className="inline-flex items-center gap-1.5 shrink-0">
        <span className="font-sans text-xs text-fg-muted uppercase">load</span>
        <span
          id={id ? `${id}-load` : 'load-readout'}
          className="font-mono text-xs text-fg-secondary font-medium transition-all duration-500 ease-brand"
        >
          0.42
        </span>
      </span>
    </>
  );
}

/* ─── Desktop: static bar ─── */
function StatusBarDesktop({ uptime }: { uptime: string }) {
  return (
    <div
      className="mx-auto flex max-w-content items-center justify-between px-gutter"
      style={{
        height: 36,
        fontFamily: 'JetBrains Mono, ui-monospace, monospace',
        fontSize: 11,
      }}
    >
      <StatusItems uptime={uptime} />
    </div>
  );
}

/* ─── Mobile: auto-scrolling ticker-like bar ─── */
function StatusBarMobile({ uptime }: { uptime: string }) {
  const reduced = usePrefersReducedMotion();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reduced || !scrollRef.current) return;

    const el = scrollRef.current;
    let pos = 0;
    let raf: number;

    const animate = () => {
      pos -= 0.2;
      const half = el.scrollWidth / 2;
      if (Math.abs(pos) >= half) pos = 0;
      el.style.transform = `translateX(${pos}px)`;
      raf = requestAnimationFrame(animate);
    };

    raf = requestAnimationFrame(animate);

    const pause = () => cancelAnimationFrame(raf);
    const resume = () => { raf = requestAnimationFrame(animate); };

    el.addEventListener('mouseenter', pause);
    el.addEventListener('mouseleave', resume);

    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener('mouseenter', pause);
      el.removeEventListener('mouseleave', resume);
    };
  }, [reduced]);

  /* reduced-motion fallback: static row without mask */
  if (reduced) {
    return (
      <div
        className="mx-auto max-w-content overflow-hidden px-gutter"
        style={{ height: 36 }}
      >
        <div
          className="inline-flex items-center whitespace-nowrap"
          style={{
            height: 36,
            fontFamily: 'JetBrains Mono, ui-monospace, monospace',
            fontSize: 11,
          }}
        >
          <StatusItems id="mobile" uptime={uptime} />
        </div>
      </div>
    );
  }

  return (
    <div
      className="mx-auto max-w-content overflow-hidden px-gutter"
      style={{
        height: 36,
        maskImage: 'linear-gradient(to right, transparent 0%, rgb(0,0,0) 5%, rgb(0,0,0) 95%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to right, transparent 0%, rgb(0,0,0) 5%, rgb(0,0,0) 95%, transparent 100%)',
      }}
    >
      <div
        ref={scrollRef}
        className="inline-flex items-center whitespace-nowrap will-change-transform"
        style={{
          height: 36,
          fontFamily: 'JetBrains Mono, ui-monospace, monospace',
          fontSize: 11,
        }}
      >
        <StatusItems id="mobile" uptime={uptime} />
        <span className="h-3.5 w-[0.5px] bg-border shrink-0 mx-4" />
        <StatusItems id="mobile-dup" uptime={uptime} />
        <span className="h-3.5 w-[0.5px] bg-border shrink-0 mx-4" />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   StatusBar wrapper — switches between desktop and mobile
   ═══════════════════════════════════════════════════════ */
const StatusBarInner = forwardRef<HTMLDivElement, { uptime: string }>(
  ({ uptime }, ref) => {
    return (
      <div
        ref={ref}
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          borderBottom: '0.5px solid var(--color-border)',
          boxShadow: '0 1px 10px rgba(245, 208, 112, 0.02)',
          backdropFilter: 'blur(8px)',
          background: 'linear-gradient(180deg, rgba(10,10,10,0.85) 0%, rgba(10,10,10,0.65) 100%)',
          opacity: 0,
          willChange: 'transform, opacity',
        }}
      >
        {/* Desktop: visible at md+ */}
        <div className="hidden md:block">
          <StatusBarDesktop uptime={uptime} />
        </div>

        {/* Mobile: visible below md */}
        <div className="md:hidden">
          <StatusBarMobile uptime={uptime} />
        </div>
      </div>
    );
  }
);

StatusBarInner.displayName = 'StatusBarInner';

export function StatusBar() {
  const [uptime, setUptime] = useState('');
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tick = () => {
      // Calculate uptime relative to June 12, 2026
      const startDate = new Date('2026-06-12T00:00:00');
      const now = new Date();
      const diffMs = now.getTime() - startDate.getTime();
      
      const diffSecs = Math.floor(diffMs / 1000);
      const days = Math.floor(diffSecs / (3600 * 24));
      const hours = Math.floor((diffSecs % (3600 * 24)) / 3600);
      const minutes = Math.floor((diffSecs % 3600) / 60);
      const seconds = diffSecs % 60;

      const pad = (num: number) => String(num).padStart(2, '0');
      
      setUptime(`${days}d ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`);
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!barRef.current) return;
    
    // Smooth GSAP reveal synchronized with the bootloader wipe
    gsap.fromTo(
      barRef.current,
      { opacity: 0, y: -12 },
      {
        opacity: 1,
        y: 0,
        duration: 1.1,
        ease: 'power3.out', // var(--ease-cinematic)
        delay: 1.8, // align with final settle
        clearProps: 'transform',
      }
    );
  }, []);

  return (
    <>
      <StatusBarInner ref={barRef} uptime={uptime} />
      <style>{`
        @keyframes ledPulse {
          0%, 100% { 
            opacity: 1; 
            box-shadow: 0 0 8px var(--color-success), 0 0 2px var(--color-success);
          }
          50% { 
            opacity: 0.35; 
            box-shadow: 0 0 2px rgba(168, 195, 160, 0.2);
          }
        }
        .animate-led-pulse {
          animation: ledPulse 3.5s cubic-bezier(0.16, 1, 0.3, 1) infinite;
        }
      `}</style>
    </>
  );
}
