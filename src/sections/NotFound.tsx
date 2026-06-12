import { Link } from 'react-router-dom';

// Placeholder  full custom 404 is issue #14.
export function NotFound() {
  return (
    <section className="py-section">
      <p className="font-mono text-sm text-warning">404  not found</p>
      <h1 className="mt-4 font-display text-display-2 text-fg-strong">No such route</h1>
      <Link to="/status" className="mt-6 inline-block font-mono text-accent hover:underline">
        &larr; back to /status
      </Link>
    </section>
  );
}
