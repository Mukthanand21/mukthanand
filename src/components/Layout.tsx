import { Outlet } from 'react-router-dom';
import { Nav } from './Nav';
import { Footer } from './Footer';
import { useSmoothScroll } from '../motion/useSmoothScroll';

// Shared app shell: smooth scroll, nav, routed section content, footer.
export function Layout() {
  useSmoothScroll();

  return (
    <div className="min-h-screen bg-bg text-fg">
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
    </div>
  );
}
