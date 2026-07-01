import ICON_MAP from '../data/icon-map';

export function SkillIcon({ name }: { name: string }) {
  const icon = ICON_MAP[name];
  if (!icon) return null;

  const viewBox = icon.viewBox || '0 0 24 24';

  return (
    <span className="relative flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-bg-elevated transition-colors duration-150 group-hover:bg-bg-subtle" aria-label={name}>
      <svg
        viewBox={viewBox}
        className="h-3.5 w-3.5 opacity-80 transition-opacity duration-150 group-hover:opacity-100"
        fill={`#${icon.hex}`}
        aria-hidden="true"
      >
        <path d={icon.path} />
      </svg>
    </span>
  );
}
