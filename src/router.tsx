import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { NotFound } from './sections/NotFound';

/* ═══════════════════════════════════════════════════════
   Router — single-page scroll architecture

   The index route renders IndexPage (all sections stacked).
   Deep-link routes (e.g. /status, /services) use Navigate to
   redirect to /#section-id, which triggers scrollIntoView on
   load. The 404 page remains a standalone route.
   ═══════════════════════════════════════════════════════ */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Navigate to="/status" replace /> },
      { path: 'status', element: <IndexPageWithScroll hash="status" /> },
      { path: 'services', element: <IndexPageWithScroll hash="services" /> },
      { path: 'changelog', element: <IndexPageWithScroll hash="changelog" /> },
      { path: 'stack', element: <IndexPageWithScroll hash="stack" /> },
      { path: 'contact', element: <IndexPageWithScroll hash="contact" /> },
      { path: '404', element: <NotFound /> },
      { path: '*', element: <Navigate to="/404" replace /> },
    ],
  },
]);

/* ─── Wrapper that renders IndexPage and scrolls to the target section on mount ─── */
import { useEffect, useRef } from 'react';
import { useLenis } from '@studio-freight/react-lenis';
import { useBootComplete } from './components/Layout';
import { IndexPage } from './pages/IndexPage';

function IndexPageWithScroll({ hash }: { hash: string }) {
  const bootComplete = useBootComplete();
  const lenis = useLenis();
  const hasScrolled = useRef(false);

  useEffect(() => {
    if (!bootComplete || hasScrolled.current) return;

    let attempts = 0;
    const MAX_ATTEMPTS = 50; // ~800ms max wait

    const checkElement = () => {
      if (hasScrolled.current) return;
      attempts++;

      const el = document.getElementById(hash);
      if (el && lenis) {
        hasScrolled.current = true;
        // Use Lenis scrollTo for smooth, synced scroll
        (lenis as any).scrollTo(`#${hash}`, {
          duration: 1.6,
          easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          immediate: false,
        });
      } else if (attempts < MAX_ATTEMPTS) {
        // Retry on next frame if element or Lenis isn't ready
        requestAnimationFrame(checkElement);
      }
      // else: give up silently after max attempts
    };

    requestAnimationFrame(checkElement);
  }, [bootComplete, hash, lenis]);

  return <IndexPage />;
}
