# specs-v2 / 000 — Overview & Design System
> **STATUS: V4** — This file documents the current implementation.
> See `/AGENTS.md` for the authoritative project rules. This file covers design system specifics.

---

## 1. Design Philosophy

The portfolio is a **production system / status page** framed with a **luxury editorial visual skin**.

- The **system metaphor** is the structure — status, services, changelog, stack, contact endpoint
- The **visual skin** is premium dark editorial — gold (`#F5D070`) on deep black (`#0A0A0A`)
- The entrance is a **cinematic title sequence** (multilingual script cycling → English gold lock → mask reveal)
- Interiors are **minimalist gallery spaces** — generous whitespace, careful hierarchy, premium typography
- Interactions are **fluid and reactive** — magnetic cursor, kinetic scroll, 3D rack scene

---

## 2. Color System — LOCKED

| Token | Value | Usage |
|---|---|---|
| `--color-bg` | `#0A0A0A` | Page background — deep black |
| `--color-bg-elevated` | `#111111` | Cards, panels, elevated surfaces |
| `--color-bg-subtle` | `#1A1A1A` | Borders, dividers, hover states |
| `--color-accent` | `#F5D070` | Gold — primary accent. CTAs, active nav, hero accent, bootloader lock |
| `--color-accent-dim` | `#B89442` | Dimmed gold — hover states |
| `--color-text-primary` | `#F3EAEF` | Warm off-white — headings, primary text |
| `--color-text-secondary` | `#B79CAE` | Descriptions, subtitles, body copy |
| `--color-text-muted` | `#6B4D6B` | Labels, timestamps, metadata, ticker text |
| `--color-success` | `#A8C3A0` | Live status dots, operational indicators |
| `--color-border` | `#1A1A1A` | All borders and dividers |

### Rules
- No cyan. No violet. No pure black (`#000`) or pure white (`#FFF`).
- Gold is used **sparingly** — one dominant accent per view. Never fill large areas with gold.
- No gradients on the page background. Gradients on elements (gold line, overlays) are permitted.

---

## 3. Typography — LOCKED

### Typefaces
| Role | Font | Usage |
|---|---|---|
| Display | `'Cabinet Grotesk', sans-serif` | Hero name, section titles, large numbers |
| Body | `'Inter', system-ui, sans-serif` | Descriptions, paragraphs, UI labels |
| UI labels | `Inter` with `letter-spacing: 0.08em` | Method badges, version tags, nav links |
| Code | `'JetBrains Mono', monospace` | Inline code, status indicators, some UI chrome |

### Scale
| Token | Size | Usage |
|---|---|---|
| `--text-hero` | `clamp(52px, 8vw, 88px)` | Hero name only |
| `--text-xl` | `clamp(28px, 4vw, 40px)` | Section titles |
| `--text-lg` | `18px` | Lead paragraphs |
| `--text-md` | `15px` | Card titles, body |
| `--text-sm` | `13px` | Card descriptions |
| `--text-xs` | `11px` | Labels, tags, timestamps |

### Rules
- Letter-spacing: `-0.03em` on display sizes, `+0.08em` on labels/tags
- Line height: `1.0` on hero, `1.6` on body, `1.4` on card text
- No italic anywhere
- No `text-transform: uppercase` on body text. Uppercase permitted on labels, tags, and nav links.

---

## 4. Motion Language — LOCKED

### 4.1 Entrance Sequence (Cinematic Bootloader)
See `/AGENTS.md` §3.4 for full spec. TL;DR: multilingual cycling → gold lock → glow → mask reveal.

### 4.2 Scroll Architecture
- **Single-page scroll** — all 5 sections on one page, nav scrolls via Lenis `scrollTo()`
- **GSAP ScrollTrigger** is the primary scroll animation engine
- **Lenis** provides smooth physics-based scrolling, GSAP ticker is synced with Lenis

### 4.3 Per-Section Entrance (`useSectionTransition`)
Each section (via `<Section>` component) gets a scroll-triggered entrance:
1. **Label** (`[data-section-label]`): fade-in with letter-spacing tighten (0→0.6s)
2. **Description** (`[data-section-desc]`): fade-up `translateY(16px→0)` (0.25s→0.6s)
3. **Metadata** (`[data-section-meta]`): fade-up `translateY(12px→0)` (0.5s→0.5s)

Trigger at `top 82%` of viewport. Single play. Spring easing.

### 4.4 Between-Section Transitions (`useSectionTransitions`)
Cinematic overlay effects triggered at section boundaries:
| Transition | From → To | Effect |
|---|---|---|
| `rack-exit` | status → services | 3D rack slides left, gold sweep, service cards drop in |
| `gold-sweep` | services → changelog, stack → contact | Horizontal gold bar sweeps across |
| `iris-wipe` | changelog → stack | Clip-path circle grows from center |
| `parallax-shift` | (between parallax sections) | Subtle skew + scale |

All transitions are scroll-scrubbed (`scrub: 1.2`), disabled on mobile (<768px) and reduced motion.

### 4.5 Ambient Elements
- **Grain overlay:** Subtle SVG noise texture (`opacity: 0.02`) on every `<Section>` component — creates atmospheric continuity from the hero texture
- **Ambient glow:** Fixed radial gold gradient (`rgba(245,208,112, 0.035)`) that drifts to follow the active section position via GSAP `power2.out` interpolation
- **Status section overlays:** Dark gradient overlay for text legibility over 3D rack, vignette, grain

### 4.6 Easing Tokens
| Token | Value | Usage |
|---|---|---|
| `--ease-spring` | `cubic-bezier(0.16, 1, 0.3, 1)` | UI hovers, spring-back animations |
| `--ease-out` | `cubic-bezier(0.0, 0, 0.2, 1)` | Fades, simple reveals |
| `--ease-cinematic` | `cubic-bezier(0.22, 1, 0.36, 1)` | Hero reveals, mask transitions |
| `--ease-linear` | `linear` | Ticker, progress fills |

---

## 5. Layout & Spacing — LOCKED

- Sections are **full-bleed** — `100vw` with `marginLeft: calc(-50vw + 50%)` to break out of parent
- Inner content constrained to `max-width: 1100px`, centered, with gutter padding
- Section padding: `py-section` (Tailwind token)
- Nav: `52px` height, sticky top, `backdrop-filter: blur(12px)` at `z-index: 100`
- Card gap: `14px`. Card border-radius: `12px` (`rounded-card`).
- Strict 8px spacing scale. Massive whitespace.

---

## 6. Shared Components

| Component | Location | Purpose |
|---|---|---|
| `Section` | `src/components/Section.tsx` | Full-bleed wrapper + grain overlay + entrance animation |
| `Nav` | `src/components/Nav.tsx` | Scroll-to-section nav with active tracking, morphing pill |
| `Footer` | `src/components/Footer.tsx` | Scroll-to-section links, 3-column layout |
| `RackScene` | `src/components/RackScene.tsx` | 3D server rack (Three.js) behind hero section |
| `Reveal` | `src/motion/Reveal.tsx` | GSAP scroll-triggered entrance for individual elements |
| `StatusBar` | `src/components/StatusBar.tsx` | Top status bar with section indicators |
| `BootLoader` | `src/components/BootLoader.tsx` | Cinematic entrance sequence overlay |
| `LensCursor` | `src/components/LensCursor.tsx` | Custom cursor with magnetic effects |

---

## 7. Acceptance Criteria (all sections)

- [ ] All colors use `var(--color-*)` tokens — zero hardcoded hex
- [ ] All font sizes use `var(--text-*)` tokens
- [ ] GSAP entrance animations fire correctly on scroll entry
- [ ] Lenis scrolling is smooth with no jitter
- [ ] `prefers-reduced-motion` disables transforms (opacity fade only)
- [ ] Keyboard navigation logical (tab order, focus visible)
- [ ] WCAG AA contrast passes on all text
- [ ] No console errors in production build
- [ ] Responsive from 320px to 1920px (no horizontal overflow)
- [ ] No terminal tropes (no `● OPERATIONAL`, no `SESSION:`)
