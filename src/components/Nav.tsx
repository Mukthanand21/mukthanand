import { NavLink } from 'react-router-dom';

// System-style labels (AGENTS.md). Placeholder styling; full nav is issue #17.
const LINKS = [
  { to: '/status', label: '/status' },
  { to: '/services', label: '/services' },
  { to: '/changelog', label: '/changelog' },
  { to: '/stack', label: '/stack' },
  { to: '/contact', label: '/contact' },
];

export function Nav() {
  return (
    <nav className="sticky top-0 z-50 border-b border-white/5 bg-bg/80 backdrop-blur">
      <div className="mx-auto flex max-w-content items-center justify-between px-gutter py-4">
        <span className="font-mono text-sm text-fg-muted">mukthanand</span>
        <ul className="flex gap-6 font-mono text-sm">
          {LINKS.map((l) => (
            <li key={l.to}>
              <NavLink
                to={l.to}
                className={({ isActive }) =>
                  isActive ? 'text-accent' : 'text-fg-muted hover:text-fg'
                }
              >
                {l.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
