import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Nav } from './Nav';
import { Footer } from './Footer';
import { BootLoader } from './BootLoader';
import { LensCursor } from './LensCursor';
import { ScrollProvider } from '../motion/ScrollProvider';
import { BootContext } from '../hooks/useBoot';

// Shared app shell: nav, routed section content, footer.
// GSAP + Lenis via ScrollProvider wraps the entire app for smooth scroll.
export function Layout() {
  const [bootComplete, setBootComplete] = useState(false);

  return (
    <div className="min-h-screen bg-bg text-fg">
      <BootLoader onComplete={() => setBootComplete(true)} />

      <BootContext.Provider value={{ bootComplete }}>
      {/* Content renders behind BootLoader overlay, entrance animations handle reveal */}
      <div>
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
          <main id="main-content" className="mx-auto max-w-content px-gutter" tabIndex={-1}>
            <Outlet />
          </main>
          <Footer />
        </ScrollProvider>
      </div>
      </BootContext.Provider>
    </div>
  );
}
