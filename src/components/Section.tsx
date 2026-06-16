import type { ReactNode } from 'react';

type SectionProps = {
  id: string;
  label: string;
  children?: ReactNode;
  className?: string;
  labelStyle?: React.CSSProperties;
  hideLabel?: boolean;
};

// Shared section wrapper enforcing consistent vertical rhythm.
export function Section({ id, label, children, className, labelStyle, hideLabel }: SectionProps) {
  return (
    <section id={id} className={`py-section ${className ?? ''}`}>
      {!hideLabel && (
        <p className="mb-6 font-mono text-sm text-accent" style={labelStyle}>
          {label}
        </p>
      )}
      {children}
    </section>
  );
}
