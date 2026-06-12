import { Outlet } from 'react-router-dom';
import { Nav } from './Nav';
import { Footer } from './Footer';
import { useSmoothScroll } from '../motion/useSmoothScroll';

// Shared app shell: smooth scroll, nav, routed section content, footer.
export function Layout() {
  useSmoothScroll();

  return (
    <div className="min-h-screen bg-bg text-fg">
      <Nav />
      <main className="mx-auto max-w-content px-gutter">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
