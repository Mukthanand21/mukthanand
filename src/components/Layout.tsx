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

// Shared app shell: nav, routed section content, footer.
// GSAP + Lenis via ScrollProvider wraps the entire app for smooth scroll.
export function Layout() {
  const [bootComplete, setBootComplete] = useState(false);
  const { pathname } = useLocation();

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
            {pathname !== '/404' && <StatusBar />}
            <main id="main-content" className="mx-auto max-w-content px-gutter" tabIndex={-1}>
              <Outlet />
            </main>
            <Footer />
          </ScrollProvider>
        </BootContext.Provider>
      </div>
    </div>
  );
}
