import { useState, createContext, useContext, useEffect, useCallback } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Nav } from './Nav';
import { StatusBar } from './StatusBar';
import { Footer } from './Footer';
import { BootLoader } from './BootLoader';
import { LensCursor } from './LensCursor';
import { ScrollProvider } from '../motion/ScrollProvider';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

// Context to share bootComplete state with child components
const BootContext = createContext(false);
export const useBootComplete = () => useContext(BootContext);

// Shared app shell: nav, routed section content, footer.
// GSAP + Lenis via ScrollProvider wraps the entire app for smooth scroll.
export function Layout() {
  const [bootComplete, setBootComplete] = useState(false);
  const { pathname } = useLocation();
  const reduced = usePrefersReducedMotion();

  /* scroll to top after route transition completes */
  const onRouteEntered = useCallback(() => {
    window.scrollTo(0, 0);
  }, []);

  /* scroll-to-top for reduced-motion users (AnimatePresence is disabled) */
  useEffect(() => {
    if (reduced) window.scrollTo(0, 0);
  }, [pathname, reduced]);

  return (
    <div className="flex min-h-screen flex-col bg-bg text-fg">
      <BootLoader onComplete={() => setBootComplete(true)} />

      {/* hide content until boot is complete */}
      <div className={`flex flex-1 flex-col ${bootComplete ? '' : 'invisible'}`}>
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
            <main id="main-content" className="mx-auto flex w-full flex-1 max-w-content flex-col px-gutter" tabIndex={-1}>
              {reduced ? (
                <Outlet />
              ) : (
                <motion.div
                  key={pathname}
                  className="flex flex-1 flex-col"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  onAnimationComplete={onRouteEntered}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Outlet />
                </motion.div>
              )}
            </main>
            <Footer />
          </ScrollProvider>
        </BootContext.Provider>
      </div>
    </div>
  );
}
