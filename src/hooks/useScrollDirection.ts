import { useEffect, useState } from 'react';

type ScrollDirection = 'up' | 'down';

// Tracks scroll direction. Returns 'up' when scrolling up, 'down' when scrolling down.
// Includes a threshold to avoid flickering on tiny scroll movements.
export function useScrollDirection(threshold = 10): ScrollDirection {
  const [direction, setDirection] = useState<ScrollDirection>('up');

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          const delta = currentScrollY - lastScrollY;

          if (Math.abs(delta) >= threshold) {
            setDirection(delta > 0 ? 'down' : 'up');
          }

          lastScrollY = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);

  return direction;
}
