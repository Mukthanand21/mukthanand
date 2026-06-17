/* ─── social links ─── */
const SOCIALS = [
  { label: 'GitHub', href: 'https://github.com/Mukthanand21' },
  { label: 'GitLab', href: 'https://gitlab.com/mukthanandreddy21' },
  { label: 'LinkedIn', href: 'https://linkedin.com/in/mukthanand21' },
];

/* ============================================================
   Global footer
   ============================================================ */
export function Footer() {
  return (
    <footer className="border-t border-white/5">
      <div className="mx-auto max-w-content px-gutter py-12">
        <div className="flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-end">
          {/* status + system signature */}
          <div className="space-y-2">
            <p className="inline-flex items-center gap-2 font-mono text-xs text-fg-faint">
              <span className="inline-block h-2 w-2 rounded-full bg-live" />
              <span>system operational</span>
            </p>
            <p className="font-mono text-xs text-fg-faint/50">
              &copy; {new Date().getFullYear()} Mukthanand Reddy, built
              with React + Vite
            </p>
          </div>

          {/* social links */}
          <div className="flex items-center gap-6">
            {SOCIALS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-1.5 font-mono text-sm text-fg-muted transition-colors duration-200 hover:text-accent"
              >
                <span>{s.label}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
