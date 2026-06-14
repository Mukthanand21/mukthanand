import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

/* ─── nav links ─── */
const LINKS = [
  { to: '/status', label: '/status' },
  { to: '/services', label: '/services' },
  { to: '/changelog', label: '/changelog' },
  { to: '/stack', label: '/stack' },
  { to: '/contact', label: '/contact' },
];

/* ─── individual nav link with cyan active indicator ─── */
function NavItem({ to, label }: { to: string; label: string }) {
  return (
    <NavLink to={to} className="group relative block py-1">
      {({ isActive }) => (
        <>
          <span
            className={`font-mono text-sm transition-colors duration-300 ${
              isActive
                ? 'text-accent'
                : 'text-fg-muted group-hover:text-fg'
            }`}
          >
            {label}
          </span>
          {/* cyan underline indicator */}
          <span
            className={`absolute -bottom-0.5 left-0 h-px bg-accent transition-all duration-300 ${
              isActive ? 'w-full' : 'w-0 group-hover:w-full'
            }`}
          />
        </>
      )}
    </NavLink>
  );
}

/* ============================================================
   Global navigation bar
   ============================================================ */
export function Nav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-bg/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-content items-center justify-between px-gutter py-4">
        {/* logo / system name */}
        <NavLink
          to="/status"
          className="font-mono text-sm text-fg-muted transition-colors duration-300 hover:text-accent"
        >
          <span className="inline-block align-middle text-live">&#9679;</span>
          <span className="ml-2 align-middle">mukthanand</span>
        </NavLink>

        {/* desktop nav */}
        <nav aria-label="Main navigation">
          <ul className="hidden items-center gap-8 md:flex">
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

      {/* mobile dropdown */}
      {mobileOpen && (
        <div className="border-t border-white/5 bg-bg md:hidden">
          <nav aria-label="Mobile navigation">
            <ul className="flex flex-col px-gutter py-4">
              {LINKS.map((l) => (
                <li key={l.to}>
                  <NavLink
                    to={l.to}
                    onClick={() => setMobileOpen(false)}
                    className={`block py-3 font-mono text-sm transition-colors duration-200 ${
                      location.pathname === l.to
                        ? 'text-accent'
                        : 'text-fg-muted hover:text-fg'
                    }`}
                  >
                    {l.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
}
