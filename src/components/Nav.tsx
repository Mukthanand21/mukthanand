import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useScrollDirection } from '../hooks/useScrollDirection';

/* ─── nav links — monospace, system-style paths ─── */
const LINKS = [
  { to: '/status', label: '/status' },
  { to: '/services', label: '/services' },
  { to: '/changelog', label: '/changelog' },
  { to: '/stack', label: '/stack' },
  { to: '/contact', label: '/contact' },
];

/* ─── individual nav link with monospace + terminal colors ─── */
function NavItem({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `font-mono text-sm transition-colors duration-150 px-2.5 py-1.5 ${
          isActive
            ? 'text-[#EF9F27] bg-[#1a1509]'
            : 'text-[#5F5E5A] hover:text-[#D3D1C7] hover:bg-[#1a1a17]'
        }`
      }
      style={{ borderRadius: 5 }}
    >
      {label}
    </NavLink>
  );
}

/* ============================================================
   Global navigation bar — Dark system/terminal theme
   - Monospace nav links with slash prefixes
   - Logo mark with initials + name + version
   - Status pill + hire me button on the right
   - Hide on scroll down, show on scroll up
   - Amber scroll progress bar
   - Mobile hamburger with animated slide-down + blur backdrop
   ============================================================ */
export function Nav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const scrollDir = useScrollDirection(10);

  // Body scroll lock when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  // Close mobile menu on Escape
  useEffect(() => {
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileOpen) {
        setMobileOpen(false);
      }
    };
    window.addEventListener('keydown', onEscape);
    return () => window.removeEventListener('keydown', onEscape);
  }, [mobileOpen]);

  // Scroll progress state (0-100%)
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight;
      const winHeight = window.innerHeight;
      const totalScroll = docHeight - winHeight;
      const progress = totalScroll > 0 ? (scrollTop / totalScroll) * 100 : 0;
      setScrollProgress(Math.min(100, Math.max(0, progress)));
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Hide nav when scrolling down past threshold, show on scroll up
  const isHidden = scrollDir === 'down' && window.scrollY > 80;

  return (
    <>
      {/* mobile blur overlay */}
      <div
        className={`fixed inset-0 z-[99] bg-black/20 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          mobileOpen
            ? 'pointer-events-auto opacity-100'
            : 'pointer-events-none opacity-0'
        }`}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />

      <header
        className={`sticky top-0 z-[100] transition-transform duration-300 ${
          isHidden ? '-translate-y-full' : 'translate-y-0'
        }`}
        style={{
          background: '#0f0f0d',
          borderBottom: '0.5px solid #2c2c2a',
          height: 52,
        }}
      >
        <div className="mx-auto flex h-full max-w-content items-center justify-between px-gutter">
          {/* ─── Logo (left) ─── */}
          <NavLink to="/status" className="flex items-center gap-2 shrink-0">
            {/* Name */}
            <span className="font-sans" style={{ color: '#D3D1C7', fontSize: 13 }}>
              Mukthanand
            </span>
            {/* Version */}
            <span className="font-mono hidden sm:inline" style={{ color: '#444441', fontSize: 10 }}>
              v3.0.0
            </span>
          </NavLink>

          {/* ─── Right side: nav links + status pill + hire button ─── */}
          <div className="flex items-center gap-4">
            <nav aria-label="Main navigation">
              <ul className="hidden items-center gap-1 md:flex">
                {LINKS.map((l) => (
                  <li key={l.to}>
                    <NavItem to={l.to} label={l.label} />
                  </li>
                ))}
              </ul>
            </nav>

            <div className="flex items-center gap-3 shrink-0">
            {/* Status pill */}
            <div
              className="flex items-center gap-1.5"
              style={{
                border: '0.5px solid #2c2c2a',
                borderRadius: 20,
                padding: '4px 10px',
              }}
            >
              <span
                className="block rounded-full"
                style={{
                  width: 5,
                  height: 5,
                  background: '#5DCAA5',
                  animation: mobileOpen ? 'none' : 'navPulse 2s ease-in-out infinite',
                }}
              />
              <span className="font-mono" style={{ color: '#444441', fontSize: 10 }}>
                3 running
              </span>
            </div>

            {/* mobile hamburger */}
            <button
              type="button"
              className="relative flex h-8 w-8 items-center justify-center md:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
            >
              <span className="sr-only">{mobileOpen ? 'Close' : 'Menu'}</span>
              <span
                className={`block h-px w-5 transition-all duration-300 ${
                  mobileOpen ? 'translate-y-0 rotate-45' : '-translate-y-1.5'
                }`}
                style={{ background: '#D3D1C7' }}
              />
              <span
                className={`block h-px w-5 transition-all duration-300 ${
                  mobileOpen ? 'opacity-0' : ''
                }`}
                style={{ background: '#D3D1C7' }}
              />
              <span
                className={`block h-px w-5 transition-all duration-300 ${
                  mobileOpen ? 'translate-y-0 -rotate-45' : 'translate-y-1.5'
                }`}
                style={{ background: '#D3D1C7' }}
              />
            </button>
          </div>
          </div>
        </div>

        {/* scroll progress bar — amber line at nav bottom */}
        <div
          className="absolute bottom-0 left-0 h-px transition-[width] duration-150 ease-out will-change-[width]"
          style={{
            width: `${scrollProgress}%`,
            background: '#EF9F27',
          }}
        />

        {/* mobile dropdown */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-out md:hidden ${
            mobileOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div style={{ borderTop: '0.5px solid #2c2c2a', background: '#0f0f0d' }}>
            <nav aria-label="Mobile navigation">
              <ul className="flex flex-col px-gutter py-4">
                {LINKS.map((l) => (
                  <li key={l.to}>
                    <NavLink
                      to={l.to}
                      onClick={() => setMobileOpen(false)}
                      className={({ isActive }) =>
                        `block py-3 font-mono text-sm transition-colors duration-150 ${
                          isActive
                            ? 'text-[#EF9F27]'
                            : 'text-[#5F5E5A] hover:text-[#D3D1C7]'
                        }`
                      }
                    >
                      {l.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </header>

      {/* ─── Pulse keyframe for the status dot ─── */}
      <style>{`
        @keyframes navPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </>
  );
}
