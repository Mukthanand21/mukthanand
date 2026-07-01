import { useCallback } from 'react';
import { useLenis } from '@studio-freight/react-lenis';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

/* ─── section link map ─── */
const SECTION_LINKS = [
  { id: 'status', label: '/status' },
  { id: 'services', label: '/services' },
  { id: 'changelog', label: '/changelog' },
  { id: 'stack', label: '/stack' },
  { id: 'contact', label: '/contact' },
];

/* ─── social links ─── */
const SOCIALS = [
  {
    label: '/github',
    href: 'https://github.com/Mukthanand21',
    icon: (
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
      </svg>
    ),
  },
  {
    label: '/viswam',
    href: 'https://code.swecha.org/Mukthanand21',
    icon: (
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
        <path d="M22.65 14.39L12 22.13 1.35 14.39a.84.84 0 01-.3-.94l1.22-3.78 2.44-7.51A.42.42 0 014.82 2a.43.43 0 01.58 0 .42.42 0 01.11.18l2.44 7.49h8.1l2.44-7.51A.42.42 0 0118.6 2a.43.43 0 01.58 0 .42.42 0 01.11.18l2.44 7.51L23 13.45a.84.84 0 01-.35.94z" />
      </svg>
    ),
  },
  {
    label: '/gitlab',
    href: 'https://gitlab.com/mukthanandreddy21',
    icon: (
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
        <path d="M22.65 14.39L12 22.13 1.35 14.39a.84.84 0 01-.3-.94l1.22-3.78 2.44-7.51A.42.42 0 014.82 2a.43.43 0 01.58 0 .42.42 0 01.11.18l2.44 7.49h8.1l2.44-7.51A.42.42 0 0118.6 2a.43.43 0 01.58 0 .42.42 0 01.11.18l2.44 7.51L23 13.45a.84.84 0 01-.35.94z" />
      </svg>
    ),
  },
  {
    label: '/linkedin',
    href: 'https://linkedin.com/in/mukthanand21',
    icon: (
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
];

const BUILD = 'v3.0.0';

/* ═══════════════════════════════════════════════════════
   Global footer — 3-column system dashboard layout
   system | navigate | connect
   ═══════════════════════════════════════════════════════ */
export function Footer() {
  const reduced = usePrefersReducedMotion();
  const lenis = useLenis();

  const scrollToSection = useCallback(
    (id: string) => {
      if (lenis && !reduced) {
        (lenis as any).scrollTo(`#${id}`, {
          duration: 1.2,
          easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        });
      } else {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
        }
      }
    },
    [lenis, reduced],
  );

  const scrollToTop = () => {
    if (lenis && !reduced) {
      (lenis as any).scrollTo(0, {
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      });
    } else {
      window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
    }
  };

  return (
    <footer
      style={{
        position: 'relative',
        zIndex: 10,
        background: 'var(--color-bg)',
        borderTop: '1px solid var(--color-border)',
      }}
    >
      {/* ─── 3-column grid — system | navigate | connect ─── */}
      <div className="mx-auto max-w-content px-gutter py-6 sm:py-10">
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-[auto_1fr_auto] sm:gap-12">
          {/* ─── SYSTEM — centered on mobile, left-aligned on desktop ─── */}
          <div className="col-span-3 sm:col-span-1 text-center sm:text-left">
            <p className="col-label">SYSTEM</p>
            <div className="status-row justify-center sm:justify-start">
              <span className="status-dot" />
              <span className="status-text">operational</span>
            </div>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 mt-2 text-xs font-mono">
              <div className="build-row mt-0">
                <span className="build-key">build:</span>
                <span className="build-val">{BUILD}</span>
              </div>
              <div className="build-row mt-0">
                <span className="build-key">region:</span>
                <span className="build-val">IND Hyd</span>
              </div>
              <div className="build-row mt-0 hidden sm:flex">
                <span className="build-key">stack:</span>
                <span className="build-val">react + vite</span>
              </div>
            </div>
            <p className="copy mt-3">&copy; {new Date().getFullYear()} mukthanand reddy</p>
          </div>

          {/* ─── NAVIGATE — hidden on mobile ─── */}
          <div className="hidden sm:flex sm:flex-col sm:items-center md:text-center">
            <p className="col-label">NAVIGATE</p>
            <div className="nav-links">
              {SECTION_LINKS.map((link) => (
                <button
                  key={link.id}
                  onClick={() => scrollToSection(link.id)}
                  className="nav-link bg-transparent border-none p-0 text-left cursor-pointer"
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>

          {/* ─── CONNECT — hidden on mobile, right-aligned on desktop ─── */}
          <div className="hidden sm:block sm:mr-12 md:text-right">
            <p className="col-label">CONNECT</p>
            <div className="social-links">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link"
                >
                  <span className="social-icon">{s.icon}</span>
                  <span>{s.label}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── bottom bar: back to top — hidden on mobile ─── */}
      <div
        className="hidden sm:block mx-auto max-w-content px-gutter"
        style={{ borderTop: '0.5px solid #2c2c2a' }}
      >
        <div className="flex items-center justify-between py-4">
          <p className="font-mono text-[11px] text-[#444441]">
            <span className="text-[#2c2c2a]">status:</span>{' '}
            <span>available for work</span>
          </p>
          <button onClick={scrollToTop} className="back-top" aria-label="Back to top">
            back to top <span className="up-arrow">&uarr;</span>
          </button>
        </div>
      </div>

      <style>{`
        .col-label {
          font-size: 10px;
          font-family: Inter, system-ui, sans-serif;
          color: #444441;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 12px;
        }

        .status-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 6px;
        }
        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #5DCAA5;
          flex-shrink: 0;
        }
        .status-text {
          font-size: 12px;
          font-family: Inter, system-ui, sans-serif;
          color: #5DCAA5;
        }
        .build-row {
          display: flex;
          gap: 6px;
          align-items: baseline;
          margin-top: 6px;
        }
        .build-key {
          font-size: 10px;
          font-family: Inter, system-ui, sans-serif;
          color: #2c2c2a;
        }
        .build-val {
          font-size: 11px;
          font-family: Inter, system-ui, sans-serif;
          color: #5F5E5A;
        }
        .copy {
          font-size: 11px;
          font-family: Inter, system-ui, sans-serif;
          color: #444441;
          margin-top: 6px;
        }
        .nav-links {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .nav-link {
          font-size: 12px;
          font-family: Inter, system-ui, sans-serif;
          color: #5F5E5A;
          text-decoration: none;
          transition: color 0.15s;
        }
        .nav-link:hover {
          color: #D3D1C7;
        }
        .social-links {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .social-link {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          font-family: Inter, system-ui, sans-serif;
          color: #5F5E5A;
          text-decoration: none;
          transition: color 0.15s;
        }
        .social-link:hover {
          color: #D3D1C7;
        }
        .social-icon {
          width: 14px;
          height: 14px;
          opacity: 0.5;
          flex-shrink: 0;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .social-link:hover .social-icon {
          opacity: 1;
        }
        .back-top {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-family: Inter, system-ui, sans-serif;
          color: #444441;
          cursor: pointer;
          border: none;
          background: none;
          padding: 0;
          transition: color 0.15s;
        }
        .back-top:hover {
          color: #EF9F27;
        }
        .up-arrow {
          transition: transform 0.15s;
        }
        .back-top:hover .up-arrow {
          transform: translateY(-1px);
        }
        @media (max-width: 639px) {
          .col-label { font-size: 8px; margin-bottom: 6px; letter-spacing: 0.06em; text-align: center; }
          .social-link { font-size: 11px; gap: 4px; flex-direction: row; }
          .social-icon { width: 14px; height: 14px; }
          .social-links { flex-direction: row; flex-wrap: wrap; gap: 16px; justify-content: center; }
        }
      `}</style>
    </footer>
  );
}
