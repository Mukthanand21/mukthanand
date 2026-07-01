import { type FormEvent, useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Section } from '../components/Section';
import { Reveal } from '../motion/Reveal';
import { useMagneticTilt } from '../hooks/useMagneticTilt';
import { useUptime } from '../hooks/useUptime';

/* ─── social config: icon SVG paths + brand colors ─── */
type SocialConfig = {
  label: string;
  href: string;
  path: string;
  brandColor: string;
  featured?: boolean;
};

const SOCIALS: SocialConfig[] = [
  {
    label: 'GitLab',
    href: 'https://code.swecha.org/Mukthanand21',
    path: 'M23.955 13.587l-1.334-4.109-2.029-6.242a.5.5 0 0 0-.954 0L17.56 9.478H6.44L4.362 3.236a.5.5 0 0 0-.954 0L1.379 9.478.045 13.587a.465.465 0 0 0 .17.514L12 21.365l11.785-7.264a.465.465 0 0 0 .17-.514',
    brandColor: '#FC6D26',
    featured: true,
  },
  {
    label: 'GitHub',
    href: 'https://github.com/Mukthanand21',
    path: 'M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12',
    brandColor: '#888',
  },
  {
    label: 'LinkedIn',
    href: 'https://linkedin.com/in/mukthanand21',
    path: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.226.792 24 1.771 24h20.451C23.2 24 24 23.226 24 22.271V1.729C24 .774 23.2 0 22.225 0z',
    brandColor: '#0A66C2',
  },
  {
    label: 'Resume',
    href: 'https://drive.google.com/file/d/1x4HWdyhLU385gdNF4N_C3SwK1_5hhEGI/view?usp=sharing',
    path: 'M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2zM12 18l-4-4h2.5v-4h3v4H16l-4 4z',
    brandColor: '#F5D070',
  },
];

/* ─── Web3Forms access key ─── */
// Public-facing by design — Web3Forms uses domain allowlisting for security
const WEB3FORMS_KEY = '7d4ed926-a5cc-4b9d-9573-b03738eb2975';

/* ─── form state types ─── */
type FormState = 'idle' | 'sending' | 'success' | 'error';

type FormErrors = {
  name?: string;
  email?: string;
  message?: string;
};

const MAX_MESSAGE_LENGTH = 2000;
const MIN_MESSAGE_LENGTH = 10;

/* ─── pure helper: request ID (moved outside component) ─── */
function generateRequestId() {
  const hex = Array.from({ length: 6 }, () =>
    Math.floor(Math.random() * 16).toString(16),
  ).join('');
  return `REQ_${hex}`;
}

function validateForm(form: HTMLFormElement): FormErrors {
  const errors: FormErrors = {};
  const name = (form.elements.namedItem('name') as HTMLInputElement)?.value.trim();
  const email = (form.elements.namedItem('email') as HTMLInputElement)?.value.trim();
  const message = (form.elements.namedItem('message') as HTMLTextAreaElement)?.value.trim();

  if (!name || name.length < 2) errors.name = 'Requires at least 2 characters';
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Requires a valid email address';
  if (!message || message.length < MIN_MESSAGE_LENGTH) errors.message = `Requires at least ${MIN_MESSAGE_LENGTH} characters`;

  return errors;
}

/* ─── inline field component ─── */
function Field({ id, label, error, children }: { id: string; label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block font-mono text-xs uppercase tracking-[0.08em] text-fg-muted">
        {label}
      </label>
      {children}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="mt-1.5 font-mono text-[11px] text-accent/80"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── SuccessState ─── */
function SuccessState({ requestId }: { requestId: string }) {
  return (
    <motion.div
      key="success"
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.97 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="flex min-h-[280px] items-center justify-center rounded-card border-thin border-success/20 bg-bg-subtle p-8"
    >
      <div className="text-center font-mono text-sm leading-relaxed text-success">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.3, ease: 'back.out(1.7)' }}
          className="mb-3 text-xs uppercase tracking-[0.08em] opacity-70"
        >
          REQUEST_RECEIVED
        </motion.div>
        <p className="mb-1 text-success/80">{requestId}</p>
        <p>I&rsquo;ll respond within 48h.</p>
      </div>
    </motion.div>
  );
}

/* ─── ErrorBanner ─── */
function ErrorBanner() {
  return (
    <motion.div
      key="error-banner"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="rounded-card border-thin border-accent/20 bg-accent/5 px-4 py-3 font-mono text-xs leading-relaxed text-accent"
    >
      <div className="mb-1 uppercase tracking-[0.08em] opacity-70">REQUEST_FAILED</div>
      <p>
        Try{' '}
        <a href="mailto:mukthanandreddy21@gmail.com" className="underline underline-offset-2 hover:no-underline">
          mukthanandreddy21@gmail.com
        </a>
      </p>
    </motion.div>
  );
}

/* ─── PremiumSocialCard — brand-identity card with accent bar, subtitle, glow ─── */
function PremiumSocialCard({ link }: { link: SocialConfig }) {
  const tiltRef = useMagneticTilt<HTMLAnchorElement>();
  const hostname = new URL(link.href).hostname.replace('www.', '');
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 0, h: 0 });

  // Measure wrapper dimensions dynamically so the SVG rect + stroke-dashoffset
  // match the actual card size regardless of responsive padding.
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const measure = () => {
      const rect = el.getBoundingClientRect();
      setDims({ w: rect.width, h: rect.height });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // SVG dash parameters — a single 40px glowing dash travels the full perimeter
  const perimeter = 2 * (dims.w + dims.h);
  const finalOffset = -(perimeter + 40);

  const card = (
    <a
      ref={tiltRef}
      href={link.href}
      target="_blank"
      rel="noopener noreferrer"
      className={`group flex items-center gap-3 rounded-xl bg-bg-elevated px-3 py-3 sm:px-4 sm:py-2.5 transition-all duration-300 hover:-translate-y-0.5 ${
        link.featured ? 'border-0 relative z-[1]' : 'border border-border relative'
      }`}
      style={{
        perspective: '800px',
        transformStyle: 'preserve-3d',
      } as React.CSSProperties}
    >
      {/* Brand-tinted glow — visible by default for featured, fades in for others */}
      <div
        className={`pointer-events-none absolute inset-0 rounded-xl transition-opacity duration-500 ${
          link.featured ? 'opacity-50 group-hover:opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}
        style={{
          background: `radial-gradient(ellipse 80% 60% at 30% 50%, ${link.brandColor}18 0%, transparent 70%)`,
        }}
      />

      {/* Left brand accent bar — visible by default for featured, fades in for others */}
      <span
        className={`absolute left-0 top-[15%] h-[70%] w-[2px] rounded-full transition-all duration-300 ${
          link.featured
            ? 'opacity-70 group-hover:opacity-100'
            : 'opacity-30 group-hover:opacity-100'
        }`}
        style={{ background: link.brandColor }}
      />

      {/* Icon container */}
      <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border bg-bg transition-all duration-300 group-hover:border-accent/15">
        {/* Glow ring behind icon on hover */}
        <span
          className="pointer-events-none absolute inset-[-2px] rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-60"
          style={{
            background: `radial-gradient(50% 50% at 50% 50%, ${link.brandColor}40 0%, transparent 70%)`,
          }}
        />
        <svg
          viewBox="0 0 24 24"
          className="relative h-4 w-4 opacity-80 transition-all duration-300 group-hover:opacity-100 group-hover:scale-110"
          fill={link.brandColor}
          aria-hidden="true"
        >
          <path d={link.path} />
        </svg>
      </span>

      {/* Label + subtitle */}
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-2 truncate font-sans text-sm font-medium text-fg transition-colors duration-300 group-hover:text-accent">
          {link.label}
          {link.featured && (
            <span className="shrink-0 rounded-full border border-accent/25 bg-accent/8 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-accent/70">
              primary
            </span>
          )}
        </p>
        <p className="mt-0.5 truncate font-mono text-[11px] text-fg-muted/40 hidden sm:block">
          {hostname}
        </p>
      </div>

      {/* Arrow — slides right on hover */}
      <span className="hidden sm:flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border transition-all duration-300 group-hover:translate-x-0.5 group-hover:border-accent/20 group-hover:bg-accent/5">
        <span className="font-mono text-[11px] text-fg-muted transition-colors duration-300 group-hover:text-accent">
          ↗
        </span>
      </span>
    </a>
  );

  // For featured cards, wrap in a measured <div> with an SVG dash-on-border overlay.
  // Uses CSS @keyframes injected dynamically so stroke-dashoffset scales to any card size.
  if (link.featured) {
    return (
      <div ref={wrapperRef} className="relative rounded-xl">
        {dims.w > 0 && dims.h > 0 && (
          <>
            <style>{`
              @keyframes gl-trace {
                0%   { stroke-dashoffset: 0; opacity: 1; }
                85%  { opacity: 1; }
                95%  { opacity: 0; }
                100% { stroke-dashoffset: ${finalOffset}; opacity: 0; }
              }
            `}</style>
            <svg
              viewBox={`0 0 ${dims.w} ${dims.h}`}
              className="pointer-events-none absolute inset-0 z-[2] h-full w-full overflow-visible"
            >
              <rect
                x="0.75"
                y="0.75"
                width={dims.w - 1.5}
                height={dims.h - 1.5}
                rx="12"
                ry="12"
                fill="none"
                stroke="#FC6D26"
                strokeWidth="1.5"
                strokeDasharray={`40 ${perimeter}`}
                style={{
                  filter: 'drop-shadow(0 0 4px rgba(252,109,38,0.8))',
                  animation: 'gl-trace 2.5s linear infinite',
                }}
              />
            </svg>
          </>
        )}
        {card}
      </div>
    );
  }

  return card;
}

/* ─── DirectEmailCard — same card format, with copy state ─── */
const MAIL_PATH = 'M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z';

function DirectEmailCard({ copied, onCopy }: { copied: boolean; onCopy: () => void }) {
  const tiltRef = useMagneticTilt<HTMLButtonElement>();

  return (
    <button
      ref={tiltRef}
      onClick={onCopy}
      aria-label="Copy email address"
      className="group relative flex w-full items-center gap-3 rounded-xl border border-border bg-bg-elevated px-3 py-3 sm:px-4 sm:py-2.5 text-left transition-all duration-300 hover:-translate-y-0.5"
      style={{
        perspective: '800px',
        transformStyle: 'preserve-3d',
      } as React.CSSProperties}
    >
      {/* Gold-tinted glow */}
      <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-br from-accent/[0.04] to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      {/* Left accent bar */}
      <span className="absolute left-0 top-[15%] h-[70%] w-[2px] rounded-full bg-accent opacity-30 transition-all duration-300 group-hover:opacity-100" />

      {/* Icon container */}
      <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border bg-bg transition-all duration-300 group-hover:border-accent/15">
        <svg
          viewBox="0 0 24 24"
          className="relative h-4 w-4 opacity-80 transition-all duration-300 group-hover:opacity-100 group-hover:scale-110"
          fill="var(--color-accent)"
          aria-hidden="true"
        >
          <path d={MAIL_PATH} />
        </svg>
      </span>

      {/* Label + subtitle */}
      <div className="min-w-0 flex-1">
        <p className="truncate font-sans text-sm font-medium text-fg transition-colors duration-300 group-hover:text-accent">
          mukthanandreddy21@gmail.com
        </p>
        <p className="mt-0.5 font-mono text-[11px] text-fg-muted/40 hidden sm:block">{copied ? 'Copied!' : 'Click to copy'}</p>
      </div>

      {/* Status indicator */}
      <span
        className={`hidden sm:flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
          copied
            ? 'border-success/20 bg-success/5'
            : 'border-border group-hover:border-accent/20 group-hover:bg-accent/5'
        }`}
        aria-live="polite"
        aria-atomic="true"
      >
        <span
          className={`font-mono text-[11px] transition-all duration-300 ${
            copied ? 'text-success' : 'text-fg-muted group-hover:text-accent'
          }`}
        >
          {copied ? '✓' : '↗'}
        </span>
      </span>
    </button>
  );
}

/* ============================================================
   /contact section — POST /hire
   ============================================================ */
export function Contact() {
  const uptime = useUptime();
  const [formState, setFormState] = useState<FormState>('idle');
  const [errors, setErrors] = useState<FormErrors>({});
  const [copied, setCopied] = useState(false);
  const [requestId, setRequestId] = useState('');
  const [messageLength, setMessageLength] = useState(0);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup copy timer on unmount
  useEffect(() => {
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;

    const validationErrors = validateForm(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setFormState('sending');

    const formData = new FormData(form);
    formData.append('access_key', WEB3FORMS_KEY);

    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        setRequestId(generateRequestId());
        setFormState('success');
        form.reset();
        setMessageLength(0);
      } else {
        setFormState('error');
      }
    } catch {
      setFormState('error');
    }
  };

  const handleCopyEmail = useCallback(async () => {
    try {
      await navigator.clipboard.writeText('mukthanandreddy21@gmail.com');
      setCopied(true);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  }, []);

  const showError = formState === 'error';

  return (
    <Section id="contact" label="POST /hire" title="Get in Touch">
      <div className="mb-10">
        <p className="max-w-prose font-sans text-base leading-relaxed text-fg-secondary" data-section-desc>
          I’m always open to new projects, opportunities, or just a quick chat. Drop me a line.
        </p>
        <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs text-fg-muted" data-section-meta>
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-success" />
            <span>signal: strong</span>
          </span>
          <span className="hidden sm:inline text-fg-muted/30">|</span>
          <span>uptime: {uptime || '0d 00:00:00'}</span>
        </p>
      </div>

      <div className="relative grid gap-12 lg:grid-cols-[auto_auto] lg:items-start overflow-hidden">
        {/* ─── soft radial gold glow behind form ─── */}
        <div
          className="pointer-events-none absolute -left-20 -top-20 -bottom-20 z-0"
          style={{
            width: 'min(500px, 50vw)',
            background:
              'radial-gradient(ellipse 60% 50% at 40% 50%, rgba(245, 208, 112, 0.08) 0%, transparent 70%)',
          }}
          aria-hidden="true"
        />

        {/* ─── form column ─── */}
        <Reveal direction="left" delay={0} className="min-w-0 relative z-[1]">
          <AnimatePresence mode="wait">
            {formState === 'success' ? (
              <SuccessState key="success" requestId={requestId} />
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              >
                <form
                  onSubmit={handleSubmit}
                  className="max-w-md space-y-5"
                  onChange={() => {
                    if (formState !== 'idle' && formState !== 'sending') {
                      setFormState('idle');
                    }
                  }}
                >
                  {/* honeypot — hidden from real users, catches bots */}
                  <input
                    type="checkbox"
                    name="botcheck"
                    className="hidden"
                    style={{ display: 'none' }}
                    tabIndex={-1}
                    autoComplete="off"
                  />

                  <Field id="name" label="Name" error={errors.name}>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      autoComplete="name"
                      onChange={() => {
                        if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                      }}
                      className={`w-full rounded-lg border-thin bg-bg-elevated px-3.5 py-3.5 font-sans text-sm text-fg outline-none caret-[var(--color-accent)] transition-[background,border-color] duration-150 placeholder:text-fg-muted/40 focus:border-accent focus:ring-[3px] focus:ring-accent/20 ${
                        errors.name ? 'border-accent/40' : 'border-fg-muted/20'
                      }`}
                      placeholder="Your name"
                    />
                  </Field>

                  <Field id="email" label="Email" error={errors.email}>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                      onChange={() => {
                        if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                      }}
                      className={`w-full rounded-lg border-thin bg-bg-elevated px-3.5 py-3.5 font-sans text-sm text-fg outline-none caret-[var(--color-accent)] transition-[background,border-color] duration-150 placeholder:text-fg-muted/40 focus:border-accent focus:ring-[3px] focus:ring-accent/20 ${
                        errors.email ? 'border-accent/40' : 'border-fg-muted/20'
                      }`}
                      placeholder="you@example.com"
                    />
                  </Field>

                  <Field id="message" label="Message" error={errors.message}>
                    <div className="relative">
                      <textarea
                        id="message"
                        name="message"
                        required
                        rows={4}
                        maxLength={MAX_MESSAGE_LENGTH}
                        onChange={(e) => {
                          setMessageLength(e.target.value.length);
                          if (errors.message) setErrors((prev) => ({ ...prev, message: undefined }));
                        }}
                        className={`w-full resize-y rounded-lg border-thin bg-bg-elevated px-3.5 py-3.5 font-sans text-sm text-fg outline-none caret-[var(--color-accent)] transition-[background,border-color] duration-150 placeholder:text-fg-muted/40 focus:border-accent focus:ring-[3px] focus:ring-accent/20 ${
                          errors.message ? 'border-accent/40' : 'border-fg-muted/20'
                        }`}
                        placeholder="What would you like to discuss?"
                      />
                      <span className="pointer-events-none absolute bottom-2 right-3 font-mono text-[10px] text-fg-muted/40">
                        {messageLength}/{MAX_MESSAGE_LENGTH}
                      </span>
                    </div>
                  </Field>

                  <AnimatePresence>{showError && <ErrorBanner />}</AnimatePresence>

                  <button
                    type="submit"
                    disabled={formState === 'sending'}
                    className="w-full rounded-lg bg-accent px-6 py-3 font-mono text-sm font-semibold text-[#2E1F2E] transition-all duration-150 hover:-translate-y-0.5 hover:bg-accent-dim focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {formState === 'sending' ? (
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
              </motion.div>
            )}
          </AnimatePresence>
        </Reveal>

        {/* ─── links column ─── */}
        <Reveal direction="right" delay={0.08} className="min-w-0 lg:self-start">
          <div className="space-y-8">
            {/* direct email */}
            <div>
              <h4 className="mb-3 font-mono text-xs uppercase tracking-[0.08em] text-fg-muted">
                Direct Email
              </h4>
              <DirectEmailCard copied={copied} onCopy={handleCopyEmail} />
            </div>

            {/* social */}
            <div>
              <h4 className="mb-3 font-mono text-xs uppercase tracking-[0.08em] text-fg-muted">
                Social
              </h4>
              <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-col sm:gap-0 sm:space-y-3">
                {SOCIALS.map((link, i) => (
                  <Reveal key={link.label} delay={i * 0.06} className="list-none">
                    <PremiumSocialCard link={link} />
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
