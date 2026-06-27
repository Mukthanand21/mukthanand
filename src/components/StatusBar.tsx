/* ═══════════════════════════════════════════════════════
   StatusBar — system-style status bar
   On desktop: static horizontal bar with spread items.
   On mobile: auto-scrolling ticker-like animation.
   ═══════════════════════════════════════════════════════ */

import { useEffect, useRef } from 'react';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

/* ─── Render the status items as flat JSX ─── */
function StatusItems({ id }: { id?: string }) {
  return (
    <>
      {/* status — amber dot + teal text */}
      <span className="inline-flex items-center gap-2 shrink-0" style={{ paddingRight: 16 }}>
        <span
          className="block rounded-full"
          style={{ width: 5, height: 5, background: '#EF9F27', animation: 'amberPulse 2.5s ease-in-out infinite' }}
        />
        <span style={{ color: '#6FD9B6', fontWeight: 500 }}>online</span>
      </span>

      {/* divider */}
      <span style={{ width: '0.5px', height: 14, background: '#2c2c2a', display: 'inline-block', flexShrink: 0, marginRight: 16 }} />

      {/* build */}
      <span className="inline-flex items-center gap-1 shrink-0" style={{ paddingRight: 16 }}>
        <span style={{ color: '#5a5a58' }}>build:</span>
        <span style={{ color: '#7a7974', fontWeight: 500 }}>v3.0.0</span>
      </span>

      {/* divider */}
      <span style={{ width: '0.5px', height: 14, background: '#2c2c2a', display: 'inline-block', flexShrink: 0, marginRight: 16 }} />

      {/* uptime */}
      <span className="inline-flex items-center gap-1 shrink-0" style={{ paddingRight: 16 }}>
        <span style={{ color: '#5a5a58' }}>uptime:</span>
        <span id={id ? `${id}-uptime` : undefined} style={{ color: '#7a7974', fontWeight: 500 }}>142d 06:21:14</span>
      </span>

      {/* divider */}
      <span style={{ width: '0.5px', height: 14, background: '#2c2c2a', display: 'inline-block', flexShrink: 0, marginRight: 16 }} />

      {/* region */}
      <span className="inline-flex items-center gap-1 shrink-0" style={{ paddingRight: 16 }}>
        <span style={{ color: '#5a5a58' }}>region:</span>
        <span style={{ color: '#7a7974', fontWeight: 500 }}>IND Hyd</span>
      </span>

      {/* divider */}
      <span style={{ width: '0.5px', height: 14, background: '#2c2c2a', display: 'inline-block', flexShrink: 0, marginRight: 16 }} />

      {/* load */}
      <span className="inline-flex items-center gap-1 shrink-0">
        <span style={{ color: '#5a5a58' }}>load:</span>
        <span id={id ? `${id}-load` : 'load-readout'} style={{ color: '#7a7974', fontWeight: 500 }}>0.42</span>
      </span>
    </>
  );
}

/* ─── Desktop: static bar ─── */
function StatusBarDesktop() {
  return (
    <div
      className="mx-auto flex max-w-content items-center justify-between px-gutter"
      style={{
        height: 36,
        fontFamily: 'JetBrains Mono, ui-monospace, monospace',
        fontSize: 11,
      }}
    >
      <StatusItems />
    </div>
  );
}

/* ─── Mobile: auto-scrolling ticker-like bar ─── */
function StatusBarMobile() {
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
          <StatusItems id="mobile" />
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
        <StatusItems id="mobile" />
        <span style={{
          width: '0.5px',
          height: 14,
          background: '#2c2c2a',
          display: 'inline-block',
          flexShrink: 0,
          marginLeft: 16,
          marginRight: 16,
        }} />
        <StatusItems id="mobile-dup" />
        <span style={{
          width: '0.5px',
          height: 14,
          background: '#2c2c2a',
          display: 'inline-block',
          flexShrink: 0,
          marginLeft: 16,
          marginRight: 16,
        }} />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   StatusBar wrapper — switches between desktop and mobile
   ═══════════════════════════════════════════════════════ */
function StatusBarInner() {
  return (
    <div
      style={{
        position: 'relative',
        zIndex: 1,
        width: '100%',
        borderBottom: '0.5px solid #2c2c2a',
        backdropFilter: 'blur(8px)',
        background: 'linear-gradient(180deg, rgba(10,10,10,0.85) 0%, rgba(10,10,10,0.65) 100%)',
        opacity: 0,
        animation: 'statusFadeDown 0.9s 1.8s cubic-bezier(0.16,1,0.3,1) forwards',
      }}
    >
      {/* Desktop: visible at md+ */}
      <div className="hidden md:block">
        <StatusBarDesktop />
      </div>

      {/* Mobile: visible below md */}
      <div className="md:hidden">
        <StatusBarMobile />
      </div>
    </div>
  );
}

export function StatusBar() {
  return (
    <>
      <StatusBarInner />
      <style>{`
        @keyframes statusFadeDown {
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes amberPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.35; }
        }
      `}</style>
    </>
  );
}
