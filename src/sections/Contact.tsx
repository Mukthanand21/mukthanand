import { type FormEvent, useState } from 'react';
import { Section } from '../components/Section';
import { Reveal } from '../motion/Reveal';

/* ─── social links ─── */
const socialLinks = [
  { label: 'GitHub', href: 'https://github.com/Mukthanand21', icon: 'devicon-github-original' },
  { label: 'GitLab', href: 'https://code.swecha.org/Mukthanand21', icon: 'devicon-gitlab-plain' },
  { label: 'LinkedIn', href: 'https://linkedin.com/in/mukthanand21', icon: 'devicon-linkedin-plain' },
  { label: 'Resume', href: 'https://drive.google.com/file/d/1x4HWdyhLU385gdNF4N_C3SwK1_5hhEGI/view?usp=sharing', icon: null },
];

/* ─── Web3Forms access key ─── */
// Replace with your key from https://web3forms.com
const WEB3FORMS_KEY = '7d4ed926-a5cc-4b9d-9573-b03738eb2975';

/* ─── form state ─── */
type FormState = 'idle' | 'sending' | 'success' | 'error';

/* ============================================================
   /contact section — specs-v2/005-contact.md
   POST /hire — framed as an API endpoint
   ============================================================ */
export function Contact() {
  const [state, setState] = useState<FormState>('idle');
  const [copied, setCopied] = useState(false);
  const [requestId, setRequestId] = useState('');
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
        setRequestId(generateRequestId());
        setState('success');
        form.reset();
      } else {
        setState('error');
      }
    } catch {
      setState('error');
    }
  };

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText('mukthanandreddy21@gmail.com');
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable
    }
  };

  const generateRequestId = () => {
    const hex = Array.from({ length: 6 }, () =>
      Math.floor(Math.random() * 16).toString(16),
    ).join('');
    return `REQ_${hex}`;
  };

  return (
    <Section id="contact" label="POST /hire">
      <div className="mb-10">
        <p
          className="max-w-prose font-sans text-base leading-relaxed text-fg-secondary"
          data-section-desc
        >
          Send a request directly, or reach out through any channel below.
        </p>
        <p className="mt-2 flex items-center gap-3 font-mono text-xs text-fg-muted" data-section-meta>
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-success" />
            <span>latency: 24ms</span>
          </span>
          <span className="text-fg-muted/30">|</span>
          <span>signal: strong</span>
          <span className="text-fg-muted/30">|</span>
          <span>uptime: 142d</span>
        </p>
      </div>

      <div className="relative grid gap-12 lg:grid-cols-[1fr_auto] overflow-hidden">
        {/* ─── soft radial gold glow behind form ─── */}
        <div
          className="pointer-events-none absolute -left-20 -top-20 -bottom-20 w-[500px] z-0"
          style={{
            background: 'radial-gradient(ellipse 60% 50% at 40% 50%, rgba(245, 208, 112, 0.08) 0%, transparent 70%)',
          }}
          aria-hidden="true"
        />

        {/* ─── form column ─── */}
        <Reveal direction="left" delay={0} className="min-w-0 relative z-[1]">
          {state === 'success' ? (
            /* success — replace form entirely */
            <div className="flex min-h-[280px] items-center justify-center rounded-card border-thin border-success/20 bg-bg-subtle p-8">
              <div className="text-center font-mono text-sm leading-relaxed text-success">
                <div className="mb-3 text-xs uppercase tracking-[0.08em] opacity-70">
                  REQUEST_RECEIVED
                </div>
                <p className="mb-1 text-success/80">
                  {requestId}
                </p>
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
                  className="w-full rounded-lg border-thin border-fg-muted/20 bg-bg-elevated px-3.5 py-3.5 font-sans text-sm text-fg outline-none caret-[var(--color-accent)] transition-[background,border-color] duration-150 placeholder:text-fg-muted/40 focus:border-accent focus:ring-[3px] focus:ring-accent/20"
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
                  className="w-full rounded-lg border-thin border-fg-muted/20 bg-bg-elevated px-3.5 py-3.5 font-sans text-sm text-fg outline-none caret-[var(--color-accent)] transition-[background,border-color] duration-150 placeholder:text-fg-muted/40 focus:border-accent focus:ring-[3px] focus:ring-accent/20"
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
                  className="w-full resize-y rounded-lg border-thin border-fg-muted/20 bg-bg-elevated px-3.5 py-3.5 font-sans text-sm text-fg outline-none caret-[var(--color-accent)] transition-[background,border-color] duration-150 placeholder:text-fg-muted/40 focus:border-accent focus:ring-[3px] focus:ring-accent/20"
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
        </Reveal>

        {/* ─── links column ─── */}
        <Reveal direction="right" delay={0.08} className="min-w-0">
          <div className="space-y-8">
            {/* direct email */}
            <div>
              <h4 className="mb-3 font-mono text-xs uppercase tracking-[0.08em] text-fg-muted">
                Direct Email
              </h4>
              <button
                onClick={handleCopyEmail}
                className="group inline-flex cursor-pointer items-center gap-1.5 bg-transparent p-0 font-mono text-sm text-accent transition-colors duration-150 hover:opacity-70"
              >
                <span>mukthanandreddy21@gmail.com</span>
                <span className="inline-block min-w-[4.5em] text-right font-mono text-xs text-fg-muted transition-colors duration-150 group-hover:text-accent">
                  {copied ? 'Copied!' : '↗'}
                </span>
              </button>
            </div>

            {/* social */}
            <div>
              <h4 className="mb-3 font-mono text-xs uppercase tracking-[0.08em] text-fg-muted">
                Social
              </h4>
              <div className="space-y-3">
                {socialLinks.map((link, i) => (
                  <Reveal key={link.label} delay={i * 0.06} className="list-none">
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between rounded-lg border-thin border-border bg-bg-elevated px-4 py-3 transition-all duration-150 hover:border-accent/20 hover:bg-bg-subtle"
                    >
                      <span className="flex items-center gap-2.5">
                        {link.icon ? (
                          <i
                            className={`${link.icon} text-fg-muted transition-colors duration-150 group-hover:text-accent`}
                            style={{ fontSize: '16px' }}
                          />
                        ) : (
                          <svg
                            viewBox="0 0 24 24"
                            className="h-4 w-4 shrink-0 text-fg-muted transition-colors duration-150 group-hover:text-accent"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                            <polyline points="14 2 14 8 20 8" />
                            <line x1="16" y1="13" x2="8" y2="13" />
                            <line x1="16" y1="17" x2="8" y2="17" />
                            <polyline points="10 9 9 9 8 9" />
                          </svg>
                        )}
                        <span className="font-sans text-md font-medium text-fg transition-colors duration-150 group-hover:text-accent">
                          {link.label}
                        </span>
                      </span>
                      <span className="font-mono text-xs text-fg-muted transition-colors duration-150 group-hover:text-accent">
                        ↗
                      </span>
                    </a>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
