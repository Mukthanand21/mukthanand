import ICON_PATHS from '../data/icon-paths';

/* ─── inline SVG icon for a technology ─── */
export function SkillIcon({ name }: { name: string }) {
  const path = ICON_PATHS[name];
  if (!path) return null;

  return (
    <svg
      viewBox="0 0 24 24"
      className="h-3.5 w-3.5 shrink-0"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d={path} />
    </svg>
  );
}
