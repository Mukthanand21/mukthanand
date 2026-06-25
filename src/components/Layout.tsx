import { useState, createContext, useContext } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Nav } from './Nav';
import { StatusBar } from './StatusBar';
import { Footer } from './Footer';
import { BootLoader } from './BootLoader';
import { LensCursor } from './LensCursor';
import { ScrollProvider } from '../motion/ScrollProvider';

// Context to share bootComplete state with child components
const BootContext = createContext(false);
export const useBootComplete = () => useContext(BootContext);

/* ═══════════════════════════════════════════════════════
   Layout — Shared app shell

   The IndexPage (all sections stacked) is rendered via Outlet.
   On the 404 page, StatusBar is hidden. The scroll-based
   architecture means no route transitions — sections reveal
   via GSAP ScrollTrigger as the user scrolls.
   ═══════════════════════════════════════════════════════ */
export function Layout() {
  const [bootComplete, setBootComplete] = useState(false);
  const { pathname } = useLocation();
  const is404 = pathname === '/404';

  return (
    <div className="min-h-screen bg-bg text-fg">
      <BootLoader onComplete={() => setBootComplete(true)} />

      {/* hide content until boot is complete */}
      <div className={bootComplete ? '' : 'invisible'}>
        <BootContext.Provider value={bootComplete}>
          <ScrollProvider>
            <LensCursor />
            {/* skip-to-content link for keyboard users */}
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-xl focus:bg-accent focus:px-4 focus:py-2 focus:text-bg focus:shadow-lg"
            >
              Skip to main content
            </a>
            <Nav />
            {!is404 && <StatusBar />}
            {/* A — main is full-width; each section handles its own width + content max-width via <Section> */}
            <main id="main-content" tabIndex={-1}>
              <Outlet />
            </main>
            {!is404 && <Footer />}
          </ScrollProvider>
        </BootContext.Provider>
      </div>
    </div>
  );
}
