import { useEffect, useRef, useCallback } from 'react';

/* ============================================================
   LensCursor — custom lens reveal cursor.
   Acts as a spotlight: when the user moves over interactive
   elements, the cursor scales up and reveals a bright layer
   beneath using CSS clip-path.

   Uses a circular mask that follows the mouse position.
   Gracefully degrades on touch devices (hidden).
   ============================================================ */
export function LensCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const isTouchDevice = useRef(false);

  const updatePosition = useCallback((e: MouseEvent) => {
    if (!cursorRef.current) return;
    cursorRef.current.style.transform = `translate(${e.clientX - 15}px, ${e.clientY - 15}px)`;
  }, []);

  const onHoverable = useCallback(() => {
    if (!cursorRef.current) return;
    cursorRef.current.style.width = '40px';
    cursorRef.current.style.height = '40px';
    cursorRef.current.style.borderColor = 'var(--color-accent)';
    cursorRef.current.style.mixBlendMode = 'normal';
  }, []);

  const onUnhoverable = useCallback(() => {
    if (!cursorRef.current) return;
    cursorRef.current.style.width = '30px';
    cursorRef.current.style.height = '30px';
    cursorRef.current.style.borderColor = 'transparent';
    cursorRef.current.style.mixBlendMode = 'exclusion';
  }, []);

  useEffect(() => {
    isTouchDevice.current = 'ontouchstart' in window;
    if (isTouchDevice.current) return;

    // Hide default cursor
    document.body.style.cursor = 'none';

    // Add cursor style for all interactive elements
    const style = document.createElement('style');
    style.textContent = `
      a, button, input, textarea, [role="button"], [tabindex]:not([tabindex="-1"]) {
        cursor: none !important;
      }
    `;
    document.head.appendChild(style);

    window.addEventListener('mousemove', updatePosition);

    // Watch for hover on interactive elements
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'A' ||
        target.tagName === 'BUTTON' ||
        target.closest('a') ||
        target.closest('button') ||
        target.closest('[role="button"]')
      ) {
        onHoverable();
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'A' ||
        target.tagName === 'BUTTON' ||
        target.closest('a') ||
        target.closest('button') ||
        target.closest('[role="button"]')
      ) {
        onUnhoverable();
      }
    };

    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);

    return () => {
      document.body.style.cursor = '';
      style.remove();
      window.removeEventListener('mousemove', updatePosition);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
    };
  }, [updatePosition, onHoverable, onUnhoverable]);

  if (isTouchDevice.current) return null;

  return (
    <div
      ref={cursorRef}
      className="pointer-events-none fixed left-0 top-0 z-[9999] rounded-full border-2 transition-[width,height,border-color] duration-150 ease-out"
      style={{
        width: '30px',
        height: '30px',
        borderColor: 'transparent',
        mixBlendMode: 'exclusion',
        background: 'rgba(245, 208, 112, 0.08)',
        backdropFilter: 'blur(1px)',
        willChange: 'transform',
        transform: 'translate(-15px, -15px)',
      }}
      aria-hidden="true"
    />
  );
}
