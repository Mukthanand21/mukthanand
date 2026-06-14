import { useEffect } from 'react';

// Registers a keyboard shortcut (⌘K / Ctrl+K) and calls the handler.
// Common pattern for command palettes or quick-jump UX.
// When requireModifier is true (default), the key must be pressed with ⌘/Ctrl.
export function useKeyboardShortcut(
  key: string,
  handler: () => void,
  requireModifier = true,
): void {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const mod = requireModifier ? (e.metaKey || e.ctrlKey) : true;
      if (mod && e.key.toLowerCase() === key.toLowerCase()) {
        e.preventDefault();
        handler();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [key, handler, requireModifier]);
}
