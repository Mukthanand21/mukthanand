# specs-v2 / 000 — Overview & Design System
> **STATUS: V3** — This file supersedes all previous versions.
> Agents must not deviate from any token, motion rule, or typography decision
> defined here without opening a dedicated MR that updates this file first.

---

## 1. Design Philosophy

The portfolio is a **luxury editorial experience / digital atelier**, not a CV or a server dashboard.
Every visual and motion decision should reinforce this:

- The entrance is a **cinematic title sequence** (like a film production logo), not a system boot
- The multilingual script cycling → English lock is the **hero moment** — it tells a story
- Gold (`#E8B65A`) on deep black (`#0A0A0A`) is the signature palette — luxury, warm, editorial
- Interiors are **minimalist gallery spaces** — generous whitespace, careful hierarchy, premium typography
- Interactions are **fluid and reactive** — magnetic cursors, kinetic scroll, WebGL imagery

The visitor should feel like they have entered a **curated brand experience**, not browsed a portfolio.

---

## 2. Color System — LOCKED

| Token | Value | Usage |
|---|---|---|
| `--color-bg` | `#0A0A0A` | Page background — deep black |
| `--color-bg-elevated` | `#111111` | Cards, panels, elevated surfaces |
| `--color-bg-subtle` | `#1A1A1A` | Borders, dividers, hover states |
| `--color-accent` | `#E8B65A` | Primary accent — gold. CTAs, active nav, hero accent, bootloader lock |
| `--color-accent-dim` | `#A87E35` | Dimmed gold — hover states, secondary accents |
| `--color-text-primary` | `#F3EAEF` | Warm off-white — headings, primary body text |
| `--color-text-secondary` | `#B79CAE` | Descriptions, subtitles, body copy |
| `--color-text-muted` | `#6B4D6B` | Labels, timestamps, metadata, ticker text |
| `--color-success` | `#A8C3A0` | Availability indicator |
| `--color-border` | `#1A1A1A` | All borders and dividers |

### Rules
- No cyan. No violet. No pure black (`#000`) or pure white (`#FFF`).
- The only light element is `--color-text-primary` (`#F3EAEF`) — warm off-white, never cold white.
- Gold is used **sparingly** — one dominant accent per view. Never fill large areas with gold.
- No gradients on the page background. Gradients on elements (gold line, overlays) are permitted.

---

## 3. Typography — LOCKED

### Typefaces
| Role | Font | Weight | Usage |
|---|---|---|---|
| Display | `'Cabinet Grotesk', sans-serif` | 700–800 | Hero name, section titles, large numbers |
| Body | `'Inter', system-ui, sans-serif` | 400–500 | Descriptions, paragraphs, UI labels |
| UI (labels/tags) | `'Inter', system-ui, sans-serif` | 400–500 | Method badges, version tags, labels, nav links — tracked out |

> **No JetBrains Mono in UI chrome.** Inter with `letter-spacing: 0.08em` replaces all mono contexts.
> JetBrains Mono is permitted only for inline code snippets in project descriptions.

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
- Letter-spacing: `-0.03em` on display sizes (hero, section titles). `+0.08em` on labels/tags.
- Line height: `1.0` on hero. `1.6` on body. `1.4` on card text.
- No italic anywhere.
- No text-transform uppercase on body text. Uppercase permitted only on labels, tags, and nav links.
- Cabinet Grotesk should be the **first thing the visitor reads** — hero name and top-level headings.

---

## 4. Motion Language — LOCKED

### 4.1 Entrance Sequence (Cinematic Title)

This is the most important animation in the portfolio. It runs once on first load as a **film-style title sequence**, not a system boot.

**Stage 1 — Black void (0ms–300ms)**
- Screen is pure `#000` for 300ms. No text, no particles, no indicators. Complete silence.

**Stage 2 — Script cycling (300ms–2500ms)**
- 10 letters (M-U-K-T-H-A-N-A-N-D) appear center-screen in `--color-text-muted` (dim).
- Each letter cycles through 5 Indian scripts (Telugu, Devanagari, Tamil, Kannada, Bengali) at staggered intervals, creating a wave-like cascade effect.
- Letters gradually brighten as they cycle — from `--color-text-muted` toward `--color-text-primary`.
- No status text. No progress bar. No percentages. The letters are the entire show.

**Stage 3 — Gold lock (2500ms–3000ms)**
- Letters lock to English left-to-right with a 100ms stagger (250ms total for all 10).
- On lock: each letter flashes gold (`--color-accent`), scales to 1.15x, then settles to `--color-text-primary`.
- All letters resolved: the name "MUKTHANAND" glows in warm white.

**Stage 4 — The glow + gold line (3000ms–3600ms)**
- A thin gold underline (`--color-accent`, 2px, centered, `min(320px, 80vw)` wide) sweeps in from center over 600ms.
- The name holds in full brightness for 600ms of stillness — the visitor reads and absorbs.

**Stage 5 — Mask reveal (3600ms–4800ms)**
- A dramatic vertical iris wipe (GSAP `clip-path` animation) reveals the hero section beneath.
- Duration: 1200ms. Easing: `cubic-bezier(0.22, 1, 0.36, 1)`.
- The boot overlay parts like a curtain, revealing the full hero composition.

**Reduced motion:** `prefers-reduced-motion` triggers a 300ms quick reveal — skip all stages, show "MUKTHANAND" immediately in `--color-text-primary`, fade in over 300ms.

### 4.2 Scroll Animations
- **Engine:** GSAP ScrollTrigger (not IntersectionObserver). Sync with Lenis via `gsap.ticker`.
- Elements animate in on scroll entry: `translateY(24px→0)` + `opacity(0→1)`, `800ms`, `--ease-cinematic`.
- Stagger child elements 80ms apart within a section.
- Elements animate once (not on scroll-out).
- Respect `prefers-reduced-motion`: skip all transforms — opacity fade only (200ms).

### 4.3 Hover States
- **Nav links:** Magnetic UI — link pulls slightly toward cursor. Active state: underline slides in from left, `200ms`.
- **Cards:** WebGL distortion on image (R3F shader). No-image cards: border lifts to `--color-bg-subtle`, `150ms`.
- **CTA button (gold):** background `--color-accent` → `--color-accent-dim`, `120ms`. Slight `translateY(-1px)`.
- **Outline button:** border `--color-border` → `--color-accent`, text → `--color-accent`, `150ms`.
- **Custom cursor:** Morphs on interactive elements (arrow on links, magnifier on images). Scales up (1.5x) on hover.

### 4.4 Ticker
- Continuous horizontal scroll using `requestAnimationFrame`, speed `0.4px/frame` (~24px/sec).
- Content duplicated once for seamless loop.
- Pauses on hover.
- `--color-text-muted` text, letter-spacing `0.08em`, uppercase. Font: Inter (not JetBrains Mono).

### 4.5 Kinetic Scroll (Premium Interaction)
- Hero text and section titles hook into scroll velocity (via Lenis).
- On fast scroll: apply subtle skew/slant (max 3 degrees) in the direction of scroll.
- On stop: spring back to 0 degrees over 400ms (`--ease-spring`).
- Implemented via GSAP — not CSS.

### 4.6 Easing Tokens
| Token | Value | Usage |
|---|---|---|
| `--ease-spring` | `cubic-bezier(0.16, 1, 0.3, 1)` | UI hover transitions, spring-back animations |
| `--ease-out` | `cubic-bezier(0.0, 0, 0.2, 1)` | Fades, simple reveals |
| `--ease-cinematic` | `cubic-bezier(0.22, 1, 0.36, 1)` | Hero reveals, mask transitions, dramatic entrances |
| `--ease-linear` | `linear` | Ticker, progress bar fill |

---

## 5. Layout & Spacing — LOCKED

- Max content width: `1100px`, centered.
- Page horizontal padding: `clamp(20px, 5vw, 48px)`.
- Section top padding: `80px`. Section bottom padding: `64px`.
- Card gap: `14px`. Card border-radius: `12px`.
- Nav height: `52px`. Nav position: `sticky top-0`, `z-index: 100`.
- Nav background: `--color-bg` at `90% opacity` + `backdrop-filter: blur(12px)`.

---

## 6. Component Tokens

### Nav (V3 — no terminal indicators)
- Logo: `Mukthanand` in Inter, `--color-text-primary`, weight 500. No green dot before it.
- Links: Inter, weight 400, `--color-text-secondary`. Active: `--color-accent` + underline.
- No `● OPERATIONAL` indicator. No session counter. No uppercase-mono formatting on links.
- Right side: minimal — just the nav links, centered or right-aligned.

### Cards
- Background: `--color-bg-elevated`.
- Border: `0.5px solid --color-border`.
- Method badge (e.g. `POST /retrieve`): Inter, `--text-xs`, background `#3D2A3D`, color `--color-accent`.
- Title: `--text-md`, weight 600, `--color-text-primary`.
- Description: `--text-sm`, `--color-text-secondary`.
- Footer meta (URL, date): `--text-xs`, `--color-text-muted`.

### Section Slug
- E.g. `/status` — Inter, `--color-accent`, `--text-xs`, uppercase, letter-spacing `0.1em`.
- Always first element in a section, above the section title.

### Dividers
- `0.5px solid --color-border`. Never thicker.

---

## 7. Favicon — LOCKED
- File: `/public/favicon.svg`
- Design: `/ M` on `--color-bg` rounded square.
- `/` in `--color-accent` (gold). `M` in `--color-text-primary` (off-white).
- Font: Cabinet Grotesk bold, ~18px on 32×32 canvas.
- Also provide `/public/favicon.png` (32×32 rasterized fallback).

---

## 8. Agent Rules

1. **Never override a LOCKED token.** If a change is needed, open a MR that updates this file first.
2. **All colors must reference CSS custom properties** (`var(--color-bg)` etc.), never hardcoded hex.
3. **All motion must check `prefers-reduced-motion`** before applying transforms.
4. **The entrance sequence runs on every page load.** No session memory. Full cinematic sequence plays each time. respect `prefers-reduced-motion`, which triggers a 300ms quick reveal only.
5. **Animation stack:** GSAP for sequenced animations + scroll reveals. Lenis for smooth scrolling. R3F for WebGL effects. Framer Motion is deprecated for new work.
6. **No terminal tropes.** No `● OPERATIONAL`, no `SESSION:`, no `INITIALIZING...` text, no progress percentages. The bootloader is cinematic, not diagnostic.
7. **Typography:** Cabinet Grotesk via Fontshare CDN for display. Inter via Google Fonts for body. No JetBrains Mono in UI chrome.
8. **No cyan, no violet, no pure black, no pure white.**
9. **Issue #16 (real content) is a separate MR.** Do not block section implementation on content.
10. **The `/contact` social links arrow bug** (`&nearr;` rendering as literal text) must be fixed.
