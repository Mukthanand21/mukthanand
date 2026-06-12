import type { ReactNode } from 'react';

type SectionProps = {
  id: string;
  label: string;
  children?: ReactNode;
};

// Shared section wrapper enforcing consistent vertical rhythm.
export function Section({ id, label, children }: SectionProps) {
  return (
    <section id={id} className="py-section">
      <p className="mb-6 font-mono text-sm text-accent">{label}</p>
      {children}
    </section>
  );
}
