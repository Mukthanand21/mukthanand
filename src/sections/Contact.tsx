import { type FormEvent, useState } from 'react';
import { Section } from '../components/Section';
import { Reveal } from '../motion/Reveal';

/* ─── social links ─── */
const socialLinks = [
  { label: 'GitHub', href: 'https://github.com/Mukthanand21' },
  { label: 'GitLab', href: 'https://gitlab.com/mukthanandreddy21' },
  { label: 'LinkedIn', href: 'https://linkedin.com/in/mukthanand-reddy' },
];

/* ─── Web3Forms access key ─── */
// Replace with your key from https://web3forms.com
const WEB3FORMS_KEY = 'YOUR_WEB3FORMS_KEY';

/* ─── form state ─── */
type FormState = 'idle' | 'sending' | 'success' | 'error';

/* ─── response preview ─── */
function ResponsePreview({ state }: { state: FormState }) {
  if (state === 'idle' || state === 'sending') return null;

  const isSuccess = state === 'success';

  return (
    <Reveal>
      <div
        className={`mt-8 rounded-xl border p-6 font-mono text-sm ${
          isSuccess
            ? 'border-live/20 bg-live/5 text-live'
            : 'border-warning/20 bg-warning/5 text-warning'
        }`}
        role="alert"
      >
        <div className="mb-2 flex items-center gap-2">
          <span className="text-xs uppercase tracking-wider">
            {isSuccess ? '201 Created' : '500 Server Error'}
          </span>
          <span className="h-px flex-1 bg-current opacity-20" />
        </div>
        <p className="leading-relaxed">
          {isSuccess
            ? 'Message received. Response time: within 24 hours.'
            : 'Something went wrong. Please email me directly or try again.'}
        </p>
      </div>
    </Reveal>
  );
}

/* ============================================================
   /contact section
   ============================================================ */
export function Contact() {
  const [state, setState] = useState<FormState>('idle');

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
      <p className="mb-10 max-w-prose text-base leading-relaxed text-fg-muted">
        Send a message directly, or reach out through any of the channels below.
      </p>

      <div className="grid gap-12 lg:grid-cols-[1fr_auto]">
        {/* ─── form ─── */}
        <Reveal>
          <form
            onSubmit={handleSubmit}
            className="max-w-lg space-y-6"
            onChange={() => state !== 'idle' && setState('idle')}
          >
            {/* name */}
            <div>
              <label
                htmlFor="name"
                className="mb-2 block font-mono text-xs uppercase tracking-wider text-fg-muted"
              >
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                autoComplete="name"
                className="w-full rounded-xl border border-surface bg-bg-alt px-4 py-3 font-sans text-sm text-fg-strong outline-none transition-colors duration-200 placeholder:text-fg-faint focus:border-accent/50 focus:ring-1 focus:ring-accent/20"
                placeholder="Your name"
              />
            </div>

            {/* email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block font-mono text-xs uppercase tracking-wider text-fg-muted"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="w-full rounded-xl border border-surface bg-bg-alt px-4 py-3 font-sans text-sm text-fg-strong outline-none transition-colors duration-200 placeholder:text-fg-faint focus:border-accent/50 focus:ring-1 focus:ring-accent/20"
                placeholder="you@example.com"
              />
            </div>

            {/* message */}
            <div>
              <label
                htmlFor="message"
                className="mb-2 block font-mono text-xs uppercase tracking-wider text-fg-muted"
              >
                Message
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={5}
                className="w-full resize-y rounded-xl border border-surface bg-bg-alt px-4 py-3 font-sans text-sm text-fg-strong outline-none transition-colors duration-200 placeholder:text-fg-faint focus:border-accent/50 focus:ring-1 focus:ring-accent/20"
                placeholder="What would you like to discuss?"
              />
            </div>

            {/* submit */}
            <button
              type="submit"
              disabled={state === 'sending'}
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 font-mono text-sm font-semibold text-bg transition-all duration-300 hover:bg-accent/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-40"
            >
              {state === 'sending' ? (
                <>
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-bg border-t-transparent" />
                  Sending...
                </>
              ) : (
                <>
                  <span>Send</span>
                  <span className="text-xs opacity-60">&rarr;</span>
                </>
              )}
            </button>

            {/* response preview */}
            <ResponsePreview state={state} />
          </form>
        </Reveal>

        {/* ─── fallback links ─── */}
        <Reveal delay={0.15}>
          <div className="space-y-8">
            {/* direct email */}
            <div>
              <h4 className="mb-3 font-mono text-xs uppercase tracking-wider text-fg-muted">
                Direct Email
              </h4>
              <a
                href="mailto:mukthanandreddy21@gmail.com"
                className="group inline-flex items-center gap-2 font-mono text-sm text-accent transition-opacity duration-300 hover:opacity-70"
              >
                <span>mukthanandreddy21@gmail.com</span>
                <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
                  &rarr;
                </span>
              </a>
            </div>

            {/* social */}
            <div>
              <h4 className="mb-3 font-mono text-xs uppercase tracking-wider text-fg-muted">
                Social
              </h4>
              <ul className="space-y-3">
                {socialLinks.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-2 font-mono text-sm text-fg transition-colors duration-200 hover:text-accent"
                    >
                      <span>{link.label}</span>
                      <span className="inline-block text-fg-faint transition-transform duration-300 group-hover:translate-x-1">
                        &nearr;
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
