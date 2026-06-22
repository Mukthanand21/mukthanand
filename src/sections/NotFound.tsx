import { Link } from 'react-router-dom';

/* ============================================================
   Custom 404 page
   ============================================================ */
export function NotFound() {
  return (
    <section className="flex min-h-[70vh] flex-col items-center justify-center text-center">
      {/* error code */}
      <p className="font-mono text-sm text-accent">404 &mdash; not found</p>

      {/* oversized heading */}
      <h1 className="mt-6 font-display text-hero text-fg">
        Route not mapped
      </h1>

      {/* description */}
      <p className="mt-4 max-w-md text-base leading-relaxed text-fg-muted">
        The endpoint you&rsquo;re looking for doesn&rsquo;t exist on this
        server. Check the URL or return to the status page.
      </p>

      {/* back link */}
      <Link
        to="/status"
        className="group mt-10 inline-flex items-center gap-2 rounded-xl border border-accent/20 bg-accent/5 px-6 py-3 font-mono text-sm text-accent transition-all duration-300 hover:bg-accent/10 hover:shadow-[0_0_20px_-4px_rgba(245,208,112,0.15)]"
      >
        <span className="inline-block transition-transform duration-300 group-hover:-translate-x-1">
          &larr;
        </span>
        <span>Return to /status</span>
      </Link>

      {/* system hint */}
      <p className="mt-16 font-mono text-xs text-fg-faint/40">
        system&nbsp;::&nbsp;page_not_found
      </p>
    </section>
  );
}
