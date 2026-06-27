import { useState, useEffect, useCallback } from 'react';
import { useScrollDirection } from '../hooks/useScrollDirection';
import { useScrollSpy } from '../hooks/useScrollSpy';
import { useLenis } from '@studio-freight/react-lenis';
import { DimmedPunctuation } from './DimmedPunctuation';

/* ─── section IDs matching the IndexPage sections ─── */
const SECTION_IDS = ['status', 'services', 'changelog', 'stack', 'contact'] as const;

/* ─── nav links with their section IDs ─── */
const LINKS = [
  { id: 'status', label: '/status' },
  { id: 'services', label: '/services' },
  { id: 'changelog', label: '/changelog' },
  { id: 'stack', label: '/stack' },
  { id: 'contact', label: '/contact' },
];

/* ─── individual nav link with scroll-to-section behavior ─── */
function NavItem({
  id,
  label,
  active,
  onNavigate,
}: {
  id: string;
  label: string;
  active: boolean;
  onNavigate: (id: string) => void;
}) {
  return (
    <button
      onClick={() => onNavigate(id)}
      className={`font-sans font-medium text-sm transition-colors duration-150 px-2.5 py-1.5 ${active
          ? 'text-accent bg-[#1a1509]'
          : 'text-[#5F5E5A] hover:text-[#D3D1C7] hover:bg-[#1a1a17]'
        }`}
      style={{ borderRadius: 5 }}
      aria-current={active ? 'true' : undefined}
    >
      {label}
    </button>
  );
}

/* ═══════════════════════════════════════════════════════
   Global navigation bar — scroll-based architecture
   - Monospace nav links with slash prefixes
   - Logo mark with name + version
   - Status pill on the right
   - Active section tracked via IntersectionObserver
   - Hide on scroll down, show on scroll up
   - Amber scroll progress bar
   - Mobile hamburger with animated slide-down + blur backdrop
   ═══════════════════════════════════════════════════════ */
export function Nav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const scrollDir = useScrollDirection(10);

  // Active section tracking via scroll spy
  // Default to 'status' on first render to avoid flash of no-active
  const [initialSection] = useState<string>('status');
  const spySection = useScrollSpy(SECTION_IDS as unknown as string[], {
    rootMargin: '-40% 0px -40% 0px',
  });
  const activeSection = spySection ?? initialSection;

  // Lenis smooth scroll instance
  const lenis = useLenis() ?? null;

  // Scroll to a section using Lenis
  const scrollToSection = useCallback(
    (id: string) => {
      // Check if we're on the 404 page (no sections exist)
      const el = document.getElementById(id);
      if (!el) {
        // Fallback: navigate via route change
        window.location.hash = `#${id}`;
        return;
      }

      if (lenis) {
        (lenis as any).scrollTo(`#${id}`, {
          duration: 1.4,
          easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        });
      } else {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      setMobileOpen(false);
    },
    [lenis],
  );

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

  // Determine section context for nav morphing
  const isContact = activeSection === 'contact';

  return (
    <>
      {/* mobile blur overlay */}
      <div
        className={`fixed inset-0 z-[99] bg-black/20 backdrop-blur-sm transition-opacity duration-300 md:hidden ${mobileOpen
            ? 'pointer-events-auto opacity-100'
            : 'pointer-events-none opacity-0'
          }`}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />

      <header
        className={`sticky top-0 w-full z-[100] transition-transform duration-300 ${isHidden ? '-translate-y-full' : 'translate-y-0'
          }`}
        style={{
          background: '#0f0f0d',
          borderBottom: '0.5px solid #2c2c2a',
          height: 52,
        }}
      >
        <div className="mx-auto flex h-full max-w-content items-center justify-between px-gutter">
          {/* ─── Logo (left) — scrolls to top ─── */}
          <button
            onClick={() => scrollToSection('status')}
            className="flex items-center gap-2 shrink-0 bg-transparent border-none p-0 cursor-pointer"
          >
            <span className="font-sans font-medium" style={{ color: '#D3D1C7', fontSize: 13 }}>
              Mukthanand
            </span>
            <span className="font-mono font-medium hidden sm:inline" style={{ color: '#444441', fontSize: 10 }}>
              <DimmedPunctuation>v3.0.0</DimmedPunctuation>
            </span>
          </button>

          {/* ─── Right side: nav links + status pill ─── */}
          <div className="flex items-center gap-4">
            <nav aria-label="Main navigation">
              <ul className="hidden items-center gap-1 md:flex">
                {LINKS.map((l) => (
                  <li key={l.id}>
                    <NavItem
                      id={l.id}
                      label={l.label}
                      active={activeSection === l.id}
                      onNavigate={scrollToSection}
                    />
                  </li>
                ))}
              </ul>
            </nav>

            <div className="flex items-center gap-3 shrink-0">
              {/* Status pill — morphs to "hire me" on contact section */}
              <button
                onClick={() => scrollToSection('contact')}
                className="flex items-center gap-1.5 bg-transparent border-none p-0 cursor-pointer"
                style={{
                  border: '0.5px solid #2c2c2a',
                  borderRadius: 20,
                  padding: '4px 10px',
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              >
                <span
                  className="block rounded-full"
                  style={{
                    width: 5,
                    height: 5,
                    background: isContact ? 'var(--color-accent)' : '#5DCAA5',
                    animation: mobileOpen
                      ? 'none'
                      : 'navPulse 2s ease-in-out infinite',
                    transition: 'background 0.3s ease-out',
                  }}
                />
                <span
                  className="font-sans font-medium"
                  style={{
                    color: isContact ? 'var(--color-accent)' : '#444441',
                    fontSize: 10,
                    transition: 'color 0.3s ease-out',
                  }}
                >
                  {isContact ? 'hire me' : '3 running'}
                </span>
              </button>

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
                  className={`block h-px w-5 transition-all duration-300 ${mobileOpen ? 'translate-y-0 rotate-45' : '-translate-y-1.5'
                    }`}
                  style={{ background: '#D3D1C7' }}
                />
                <span
                  className={`block h-px w-5 transition-all duration-300 ${mobileOpen ? 'opacity-0' : ''
                    }`}
                  style={{ background: '#D3D1C7' }}
                />
                <span
                  className={`block h-px w-5 transition-all duration-300 ${mobileOpen ? 'translate-y-0 -rotate-45' : 'translate-y-1.5'
                    }`}
                  style={{ background: '#D3D1C7' }}
                />
              </button>
            </div>
          </div>
        </div>

        {/* mobile dropdown */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-out md:hidden ${mobileOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            }`}
        >
          <div style={{ borderTop: '0.5px solid #2c2c2a', background: '#0f0f0d' }}>
            <nav aria-label="Mobile navigation">
              <ul className="flex flex-col px-gutter py-4">
                {LINKS.map((l) => (
                  <li key={l.id}>
                    <button
                      onClick={() => scrollToSection(l.id)}
                      className={`block w-full text-left py-3 font-sans font-medium text-sm transition-colors duration-150 bg-transparent border-none cursor-pointer ${activeSection === l.id
                          ? 'text-accent'
                          : 'text-[#5F5E5A] hover:text-[#D3D1C7]'
                        }`}
                    >
                      {l.label}
                    </button>
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

      {/* scroll progress bar — amber line fixed to top of window */}
      <div
        className="fixed top-0 left-0 h-[2px] z-[101] transition-[width] duration-150 ease-out will-change-[width]"
        style={{
          width: `${scrollProgress}%`,
          background: 'var(--color-accent)',
        }}
      />
    </>
  );
}
