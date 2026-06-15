import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useScrollDirection } from '../hooks/useScrollDirection';

/* ─── nav links — editorial labels, no uppercase-mono ─── */
const LINKS = [
  { to: '/status', label: 'Status' },
  { to: '/services', label: 'Services' },
  { to: '/changelog', label: 'Changelog' },
  { to: '/stack', label: 'Stack' },
  { to: '/contact', label: 'Contact' },
];

/* ─── individual nav link with gold underline ─── */
function NavItem({ to, label }: { to: string; label: string }) {
  return (
    <NavLink to={to} className="group relative block py-1">
      {({ isActive }) => (
        <>
          <span
            className={`font-sans text-sm tracking-wide transition-colors duration-150 ${
              isActive
                ? 'text-accent'
                : 'text-fg-secondary group-hover:text-accent'
            }`}
          >
            {label}
          </span>
          {/* gold underline — slides in from left on hover/active */}
          <span
            className={`absolute -bottom-0.5 left-0 h-px bg-accent transition-all duration-150 ${
              isActive ? 'w-full' : 'w-0 group-hover:w-full'
            }`}
          />
        </>
      )}
    </NavLink>
  );
}

/* ============================================================
   Global navigation bar — V3 editorial
   - Clean sans-serif links, no terminal indicators
   - Hide on scroll down, show on scroll up
   - Gold underline active indicator
   - Scroll progress bar (1px gold line at nav bottom)
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
        className={`relative sticky top-0 z-[100] border-b border-border bg-bg/90 backdrop-blur-md transition-transform duration-300 ${
          isHidden ? '-translate-y-full' : 'translate-y-0'
        }`}
      >
        <div className="mx-auto flex max-w-content items-center justify-between px-gutter py-4">
          {/* logo / name */}
          <NavLink
            to="/status"
            className="font-sans text-sm font-medium tracking-wide text-fg transition-colors duration-150 hover:text-accent"
          >
            Mukthanand
          </NavLink>

          {/* desktop nav */}
          <nav aria-label="Main navigation" className="flex items-center gap-6">
            <ul className="hidden items-center gap-6 md:flex">
              {LINKS.map((l) => (
                <li key={l.to}>
                  <NavItem to={l.to} label={l.label} />
                </li>
              ))}
            </ul>

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
                className={`block h-px w-5 bg-fg transition-all duration-300 ${
                  mobileOpen ? 'translate-y-0 rotate-45' : '-translate-y-1.5'
                }`}
              />
              <span
                className={`block h-px w-5 bg-fg transition-all duration-300 ${
                  mobileOpen ? 'opacity-0' : ''
                }`}
              />
              <span
                className={`block h-px w-5 bg-fg transition-all duration-300 ${
                  mobileOpen ? 'translate-y-0 -rotate-45' : 'translate-y-1.5'
                }`}
              />
            </button>
          </nav>
        </div>

        {/* scroll progress bar — 1px gold line at nav bottom */}
        <div
          className="absolute bottom-0 left-0 h-px bg-accent transition-[width] duration-150 ease-out will-change-[width]"
          style={{ width: `${scrollProgress}%` }}
        />

        {/* mobile dropdown */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-out md:hidden ${
            mobileOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="border-t border-border bg-bg">
            <nav aria-label="Mobile navigation">
              <ul className="flex flex-col px-gutter py-4">
                {LINKS.map((l) => (
                  <li key={l.to}>
                    <NavLink
                      to={l.to}
                      onClick={() => setMobileOpen(false)}
                      className={({ isActive }) =>
                        `block py-3 font-sans text-sm tracking-wide transition-colors duration-150 ${
                          isActive
                            ? 'text-accent'
                            : 'text-fg-secondary hover:text-accent'
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
    </>
  );
}
