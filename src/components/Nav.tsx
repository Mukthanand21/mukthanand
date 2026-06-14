import { useState } from 'react';
import { NavLink } from 'react-router-dom';

/* ─── nav links ─── */
const LINKS = [
  { to: '/status', label: '/status' },
  { to: '/services', label: '/services' },
  { to: '/changelog', label: '/changelog' },
  { to: '/stack', label: '/stack' },
  { to: '/contact', label: '/contact' },
];

/* ─── individual nav link with gold active indicator ─── */
function NavItem({ to, label }: { to: string; label: string }) {
  return (
    <NavLink to={to} className="group relative block py-1">
      {({ isActive }) => (
        <>
          <span
            className={`font-mono text-xs uppercase tracking-wider transition-colors duration-150 ${
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

/* ─── OPERATIONAL indicator with 1.8s pulse ─── */
function StatusIndicator() {
  return (
    <span className="hidden items-center gap-2 font-mono text-xs uppercase tracking-wider text-success md:inline-flex">
      <span className="relative flex h-2 w-2">
        <span
          className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success/75"
          style={{ animationDuration: '1.8s' }}
        />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
      </span>
      <span>OPERATIONAL</span>
    </span>
  );
}

/* ============================================================
   Global navigation bar — v2 spec
   specs-v2/000-overview.md §5 Layout, §6 Component Tokens > Nav
   - 52px sticky, z-index 100
   - bg at 90% opacity + backdrop-filter blur
   - Logo: mono muted with green dot
   - Links: mono uppercase, gold on active/hover
   - Right: ● OPERATIONAL with 1.8s pulse
   - Mobile: hamburger with slide-down menu
   ============================================================ */
export function Nav() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-[100] border-b border-border bg-bg/90 backdrop-blur-md">
      <div className="mx-auto flex h-[52px] max-w-content items-center justify-between px-gutter">
        {/* logo / system name */}
        <NavLink
          to="/status"
          className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-fg-muted transition-colors duration-150 hover:text-accent"
        >
          <span className="inline-block h-2 w-2 rounded-full bg-success" />
          <span>mukthanand</span>
        </NavLink>

        {/* desktop nav */}
        <nav aria-label="Main navigation" className="flex items-center gap-8">
          <ul className="hidden items-center gap-6 md:flex">
            {LINKS.map((l) => (
              <li key={l.to}>
                <NavItem to={l.to} label={l.label} />
              </li>
            ))}
          </ul>

          {/* OPERATIONAL indicator — desktop only */}
          <StatusIndicator />

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
        <div className="border-t border-border bg-bg md:hidden">
          <nav aria-label="Mobile navigation">
            <ul className="flex flex-col px-gutter py-4">
              {LINKS.map((l) => (
                <li key={l.to}>
                  <NavLink
                    to={l.to}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `block py-3 font-mono text-xs uppercase tracking-wider transition-colors duration-150 ${
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
            {/* OPERATIONAL indicator in mobile menu */}
            <div className="border-t border-border px-gutter py-3">
              <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-success">
                <span className="relative flex h-2 w-2">
                  <span
                    className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success/75"
                    style={{ animationDuration: '1.8s' }}
                  />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
                </span>
                <span>OPERATIONAL</span>
              </span>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
