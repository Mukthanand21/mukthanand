import { type FormEvent, useState } from 'react';
import { motion } from 'framer-motion';
import { Section } from '../components/Section';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

/* ─── spring easing (mirrors --ease-spring) ─── */
const SPRING_EASE = [0.16, 1, 0.3, 1] as const;

/* ─── social links ─── */
const socialLinks = [
  { label: 'GitHub', href: 'https://github.com/Mukthanand21' },
  { label: 'GitLab', href: 'https://code.swecha.org/Mukthanand21' },
  { label: 'LinkedIn', href: 'https://linkedin.com/in/mukthanand21' },
];

/* ─── Web3Forms access key ─── */
// Replace with your key from https://web3forms.com
const WEB3FORMS_KEY = 'YOUR_WEB3FORMS_KEY';

/* ─── form state ─── */
type FormState = 'idle' | 'sending' | 'success' | 'error';

/* ============================================================
   /contact section — specs-v2/005-contact.md
   POST /hire — framed as an API endpoint
   ============================================================ */
export function Contact() {
  const [state, setState] = useState<FormState>('idle');
  const reduced = usePrefersReducedMotion();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setState('sending');

    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.append('access_key', WEB3FORMS_KEY);

    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        setState('success');
        form.reset();
      } else {
        setState('error');
      }
    } catch {
      setState('error');
    }
  };

  return (
    <Section id="contact" label="POST /hire">
      <p className="mb-10 max-w-prose font-sans text-base leading-relaxed text-fg-secondary">
        Send a request directly, or reach out through any channel below.
      </p>

      <div className="grid gap-12 lg:grid-cols-[1fr_auto]">
        {/* ─── form column ─── */}
        <motion.div
          initial={reduced ? {} : { opacity: 0, x: -12 }}
          whileInView={reduced ? {} : { opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-10% 0px' }}
          transition={{ duration: 0.5, ease: SPRING_EASE }}
        >
          {state === 'success' ? (
            /* success — replace form entirely */
            <div className="flex min-h-[280px] items-center justify-center rounded-card border-thin border-success/20 bg-bg-subtle p-8">
              <div className="text-center font-mono text-sm leading-relaxed text-success">
                <div className="mb-3 text-xs uppercase tracking-[0.08em] opacity-70">
                  REQUEST_RECEIVED
                </div>
                <p>I'll respond within 48h.</p>
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="max-w-md space-y-5"
              onChange={() => state !== 'idle' && state !== 'sending' && setState('idle')}
            >
              {/* name */}
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block font-mono text-xs uppercase tracking-[0.08em] text-fg-muted"
                >
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  autoComplete="name"
                  className="w-full rounded-lg border-thin border-border bg-bg-elevated px-3.5 py-3 font-sans text-sm text-fg outline-none transition-[background,border-color] duration-150 placeholder:text-fg-muted/40 focus:border-accent focus:ring-[3px] focus:ring-accent/20"
                  placeholder="Your name"
                />
              </div>

              {/* email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block font-mono text-xs uppercase tracking-[0.08em] text-fg-muted"
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className="w-full rounded-lg border-thin border-border bg-bg-elevated px-3.5 py-3 font-sans text-sm text-fg outline-none transition-[background,border-color] duration-150 placeholder:text-fg-muted/40 focus:border-accent focus:ring-[3px] focus:ring-accent/20"
                  placeholder="you@example.com"
                />
              </div>

              {/* message */}
              <div>
                <label
                  htmlFor="message"
                  className="mb-2 block font-mono text-xs uppercase tracking-[0.08em] text-fg-muted"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={4}
                  className="w-full resize-y rounded-lg border-thin border-border bg-bg-elevated px-3.5 py-3 font-sans text-sm text-fg outline-none transition-[background,border-color] duration-150 placeholder:text-fg-muted/40 focus:border-accent focus:ring-[3px] focus:ring-accent/20"
                  placeholder="What would you like to discuss?"
                />
              </div>

              {/* error banner */}
              {state === 'error' && (
                <div className="rounded-lg border-thin border-accent/20 bg-accent/5 px-4 py-3 font-mono text-xs leading-relaxed text-accent">
                  <div className="mb-1 uppercase tracking-[0.08em] opacity-70">
                    REQUEST_FAILED
                  </div>
                  <p>
                    Try{' '}
                    <a
                      href="mailto:mukthanandreddy21@gmail.com"
                      className="underline underline-offset-2 hover:no-underline"
                    >
                      mukthanandreddy21@gmail.com
                    </a>
                  </p>
                </div>
              )}

              {/* submit */}
              <button
                type="submit"
                disabled={state === 'sending'}
                className="w-full rounded-lg bg-accent px-6 py-3 font-mono text-sm font-semibold text-[#2E1F2E] transition-all duration-150 hover:-translate-y-0.5 hover:bg-accent-dim focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-40"
              >
                {state === 'sending' ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#2E1F2E] border-t-transparent" />
                    Sending...
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5">
                    Send
                    <span className="text-xs opacity-60">&rarr;</span>
                  </span>
                )}
              </button>
            </form>
          )}
        </motion.div>

        {/* ─── links column ─── */}
        <motion.div
          initial={reduced ? {} : { opacity: 0, x: 12 }}
          whileInView={reduced ? {} : { opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-10% 0px' }}
          transition={{ duration: 0.5, ease: SPRING_EASE, delay: reduced ? 0 : 0.08 }}
        >
          <div className="space-y-8">
            {/* direct email */}
            <div>
              <h4 className="mb-3 font-mono text-xs uppercase tracking-[0.08em] text-fg-muted">
                Direct Email
              </h4>
              <a
                href="mailto:mukthanandreddy21@gmail.com"
                className="group inline-flex items-center gap-1.5 font-mono text-sm text-accent transition-colors duration-150 hover:opacity-70"
              >
                <span>mukthanandreddy21@gmail.com</span>
                <span className="inline-block text-fg-muted transition-colors duration-150 group-hover:text-accent">
                  ↗
                </span>
              </a>
            </div>

            {/* social */}
            <div>
              <h4 className="mb-3 font-mono text-xs uppercase tracking-[0.08em] text-fg-muted">
                Social
              </h4>
              <ul className="space-y-3">
                {socialLinks.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-1.5 font-sans text-md font-medium text-fg transition-colors duration-150 hover:text-accent"
                    >
                      <span>{link.label}</span>
                      <span className="inline-block font-mono text-xs text-fg-muted transition-colors duration-150 group-hover:text-accent">
                        ↗
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </Section>
  );
}
