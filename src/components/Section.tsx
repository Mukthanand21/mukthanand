import type { ReactNode } from 'react';

type SectionProps = {
  id: string;
  label: string;
  children?: ReactNode;
  className?: string;
  labelStyle?: React.CSSProperties;
};

// Shared section wrapper enforcing consistent vertical rhythm.
export function Section({ id, label, children, className, labelStyle }: SectionProps) {
  return (
    <section id={id} className={`py-section ${className ?? ''}`}>
      <p className="mb-6 font-mono text-sm text-accent" style={labelStyle}>
        {label}
      </p>
      {children}
    </section>
  );
}
