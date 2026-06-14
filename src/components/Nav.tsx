import { useState, useCallback, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useScrollDirection } from '../hooks/useScrollDirection';
import { useKeyboardShortcut } from '../hooks/useKeyboardShortcut';

/* ─── nav links — uppercase mono per v2 spec ─── */
const LINKS = [
  { to: '/status', label: '/STATUS' },
  { to: '/services', label: '/SERVICES' },
  { to: '/changelog', label: '/CHANGELOG' },
  { to: '/stack', label: '/STACK' },
  { to: '/contact', label: '/CONTACT' },
];

/* ─── individual nav link with gold active indicator + dot ─── */
function NavItem({ to, label }: { to: string; label: string }) {
  return (
    <NavLink to={to} className="group relative block py-1">
      {({ isActive }) => (
        <>
          {/* active dot indicator — gold dot above active link */}
          <span
            className={`absolute -top-2 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-accent transition-all duration-150 ${
              isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
            }`}
          />
          <span
            className={`font-mono text-sm uppercase tracking-wider transition-colors duration-150 ${
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

/* ─── keyboard shortcut hint badge ─── */
function ShortcutHint() {
  const isMac =
    typeof navigator !== 'undefined' &&
    /Mac|iPod|iPhone|iPad/.test(navigator.platform);

  return (
    <span className="hidden rounded border border-border px-1.5 py-0.5 font-mono text-[10px] leading-none text-fg-muted md:inline-block">
      {isMac ? '\u2318K' : 'Ctrl+K'}
    </span>
  );
}

/* ─── session uptime counter ─── */
function UptimeCounter() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  const formatted = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;

  return (
    <span className="hidden items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-fg-muted md:inline-flex">
      <span className="opacity-50">SESSION:</span>
      <span className="tabular-nums">{formatted}</span>
    </span>
  );
}

/* ============================================================
   Global navigation bar — Option B + Next-Level Enhancements
   specs-v2/000-overview.md inspired
   - Flexible height, uppercase mono links, gold accent
   - Green dot logo + ● OPERATIONAL indicator
   - Hide on scroll down, show on scroll up
   - Active gold dot indicator above current link
   - Uptime counter (SESSION: MM:SS)
   - Scroll progress bar (1px gold line at nav bottom)
   - ⌘K keyboard shortcut to focus nav
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

  // Keyboard shortcut: focus the first nav link
  const handleShortcut = useCallback(() => {
    const firstLink = document.querySelector<HTMLAnchorElement>(
      'nav[aria-label="Main navigation"] a, nav[aria-label="Mobile navigation"] a',
    );
    firstLink?.focus();
  }, []);

  useKeyboardShortcut('k', handleShortcut);

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
      {/* mobile blur overlay — appears behind the mobile menu */}
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
          {/* logo / system name */}
          <NavLink
            to="/status"
            className="inline-flex items-center gap-2 font-mono text-sm uppercase tracking-wider text-fg-muted transition-colors duration-150 hover:text-accent"
          >
            <span className="inline-block h-2 w-2 rounded-full bg-success" />
            <span>mukthanand</span>
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

            <span className="hidden h-4 w-px bg-border md:block" />

            {/* OPERATIONAL indicator — desktop only */}
            <StatusIndicator />

            <UptimeCounter />

            <ShortcutHint />

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

        {/* mobile dropdown — slide animation */}
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
                        `block py-3 font-mono text-sm uppercase tracking-wider transition-colors duration-150 ${
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
        </div>
      </header>
    </>
  );
}
