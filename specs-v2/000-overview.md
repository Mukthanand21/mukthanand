# specs-v2 / 000 — Overview & Design System
> **STATUS: LOCKED**
> This document supersedes all v1 specs. Agents must not deviate from any token,
> motion rule, or typography decision defined here without opening a dedicated MR
> that updates this file first.

---

## 1. Design Philosophy

The portfolio is a **running production system**, not a static CV.
Every visual and motion decision should reinforce this metaphor:
- Pages are **endpoints** (`/status`, `/services`, `/changelog`, `/stack`, `/contact`)
- The entrance is a **system boot**, not a page load
- Data labels, version tags, and status indicators use **monospace** — they are system output
- Display headings use **bold sans** — they are the identity layer above the system

The visitor should feel like they are **accessing a live service**, not browsing a portfolio.

---

## 2. Color System — LOCKED

| Token | Value | Usage |
|---|---|---|
| `--color-bg` | `#2E1F2E` | Page background (deep plum) |
| `--color-bg-elevated` | `#3D2A3D` | Cards, panels, elevated surfaces |
| `--color-bg-subtle` | `#4D3A4D` | Borders, dividers, hover states |
| `--color-accent` | `#E8B65A` | Primary accent — gold. CTAs, active nav, version tags, method badges |
| `--color-accent-dim` | `#A87E35` | Dimmed gold — secondary accent, hover states on accent elements |
| `--color-text-primary` | `#F3EAEF` | Headings, primary body text |
| `--color-text-secondary` | `#B79CAE` | Descriptions, subtitles, body copy |
| `--color-text-muted` | `#6B4D6B` | Labels, timestamps, metadata, ticker text |
| `--color-success` | `#A8C3A0` | Availability dot, operational status |
| `--color-border` | `#3D2A3D` | All borders and dividers |

### Rules
- No cyan. No violet. No pure black (`#000`) or pure white (`#FFF`).
- The only light element allowed is `--color-text-primary` (`#F3EAEF`) — a warm off-white, never cold white.
- Gold (`--color-accent`) is used **sparingly** — one dominant element per section (active nav item, method badge, section label). Never fill large areas with gold except the CTA button.
- Background is always `--color-bg`. No gradients on the background.

---

## 3. Typography — LOCKED

### Typefaces
| Role | Font | Weight | Usage |
|---|---|---|---|
| Display | `'Inter', system-ui, sans-serif` | 700 | Hero name, section headings |
| Body | `'Inter', system-ui, sans-serif` | 400–500 | Descriptions, paragraphs |
| Mono | `'JetBrains Mono', monospace` | 400–500 | Method badges, version tags, labels, section slugs (`/status`), ticker, timestamps |

> Inter is the primary font. Load via Google Fonts or bundle locally.
> JetBrains Mono for all monospace contexts. Load via Google Fonts or bundle locally.

### Scale
| Token | Size | Usage |
|---|---|---|
| `--text-hero` | `clamp(52px, 8vw, 88px)` | Hero name only |
| `--text-xl` | `clamp(28px, 4vw, 40px)` | Section titles |
| `--text-lg` | `18px` | Lead paragraphs |
| `--text-md` | `15px` | Card titles, body |
| `--text-sm` | `13px` | Card descriptions |
| `--text-xs` | `11px` | Mono labels, tags, timestamps |

### Rules
- Letter-spacing: `-0.03em` on display sizes (hero, section titles). `+0.08em` on mono labels.
- Line height: `1.0` on hero. `1.6` on body. `1.4` on card text.
- No italic anywhere.
- No text-transform uppercase except on mono labels (version tags, method badges, section slugs, nav items).

---

## 4. Motion Language — LOCKED

### 4.1 Entrance Sequence (Full Cinematic Boot)

This is the most important animation in the portfolio. It runs once on first load.
Every stage must complete before the next begins.

**Stage 1 — Black flash (0ms–80ms)**
- Screen starts at `#000000` for 80ms — a cold start.

**Stage 2 — Boot loader (80ms–1800ms)**
- Background transitions from `#000` to `--color-bg` over 300ms.
- Monospace text appears center-screen: `MUKTHANAND.DEV` in `--color-text-muted`, letter-spacing `0.3em`.
- Below it: a thin 200px progress bar (`--color-border` track, `--color-accent` fill).
- Progress bar fills in **4 non-linear steps** (12% → 38% → 71% → 100%) with 200–350ms gaps between steps — feels like real system initialization, not a smooth animation.
- Each step triggers a **status line** in mono below the bar (e.g. `LOADING ASSETS...`, `MOUNTING ROUTES...`, `RESOLVING STACK...`, `SYSTEM READY`).
- On `SYSTEM READY`: the status line color shifts from `--color-text-muted` to `--color-accent` (gold).

**Stage 3 — Particle burst (1800ms–2200ms)**
- On completion: 18–24 small particles (`4px` circles, color `--color-accent` at 60% opacity) burst outward from center in random directions, decelerating over 400ms, then fade to 0 opacity.
- Simultaneously: the loader text and bar fade out over 200ms.

**Stage 4 — Page reveal (2200ms onward)**
- Nav fades in from top (`translateY(-12px)` → `0`, opacity `0→1`, 400ms).
- Hero version tag (`v2.0.0 — FINAL YEAR BUILD`) fades up, 100ms delay.
- Hero line 1 (`Mukthanand`) — height reveal from `0` to full, `600ms`, `cubic-bezier(0.16,1,0.3,1)`, 200ms delay.
- Hero line 2 (`Reddy.`) — same, 120ms after line 1, color `--color-accent`.
- Hero description + CTA buttons — fade + `translateY(12px→0)`, 500ms, 200ms after line 2.
- Sidebar panel — fade + `translateX(12px→0)`, 500ms, simultaneous with description.
- Ticker — begins scrolling immediately after nav reveal.
- Project cards — fade + `translateY(16px→0)`, staggered 80ms per card, begin after description.

**Replay:** A small `↺` button (bottom-right, `--color-text-muted`, appears after 3s) replays the full sequence. Hidden on mobile.

### 4.2 Scroll Animations (per-section)
- Every section's content animates in on scroll entry: `translateY(20px→0)` + `opacity(0→1)`, `500ms`, `cubic-bezier(0.16,1,0.3,1)`.
- Stagger child elements 60ms apart within a section.
- Use `IntersectionObserver` with `threshold: 0.15`.
- Elements only animate once (not on scroll-out).
- Respect `prefers-reduced-motion`: if set, skip all transforms — use opacity fade only (200ms).

### 4.3 Hover States
- Nav links: `--color-text-muted` → `--color-accent`, `150ms` ease. Underline slides in from left.
- Cards: `border-color` → `--color-bg-subtle`, `background` lifts to `#453050`, `150ms`. No scale transforms on cards.
- CTA button (gold): background `--color-accent` → `--color-accent-dim`, `120ms`. Slight `translateY(-1px)`.
- Outline button: border `--color-border` → `--color-accent`, text → `--color-accent`, `150ms`.

### 4.4 Ticker
- Continuous horizontal scroll, speed `0.4px/frame` (~24px/sec).
- Content duplicated once for seamless loop.
- Pauses on hover.
- `--color-text-muted` text, letter-spacing `0.08em`, uppercase mono.

### 4.5 Easing Tokens
| Token | Value | Usage |
|---|---|---|
| `--ease-spring` | `cubic-bezier(0.16,1,0.3,1)` | All reveal animations |
| `--ease-out` | `cubic-bezier(0.0,0,0.2,1)` | Fades, hover transitions |
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

### Nav
- Logo: `mukthanand` in mono, `--color-text-muted`. Green dot (`--color-success`) before it.
- Links: mono, `--color-text-secondary`. Active: `--color-accent` + underline.
- Right: `● OPERATIONAL` in mono, `--color-success`. Pulses at `1.8s` interval.

### Cards
- Background: `--color-bg-elevated`.
- Border: `0.5px solid --color-border`.
- Method badge (e.g. `POST /retrieve`): mono, `--color-text-xs`, background `#3D2A3D`, color `--color-accent`.
- Title: `--text-md`, weight 600, `--color-text-primary`.
- Description: `--text-sm`, `--color-text-secondary`.
- Footer meta (URL, date): `--text-xs`, mono, `--color-text-muted`.

### Section Slug
- E.g. `/status` — mono, `--color-accent`, `--text-xs`, uppercase, letter-spacing `0.1em`.
- Always first element in a section, above the section title.

### Dividers
- `0.5px solid --color-border`. Never thicker.

---

## 7. Favicon — LOCKED
- File: `/public/favicon.svg`
- Design: `/ M` on `--color-bg` rounded square.
- `/` in `--color-accent` (gold). `M` in `--color-text-primary` (off-white).
- Font: bold sans-serif, ~18px on 32×32 canvas.
- Also provide `/public/favicon.png` (32×32 rasterized fallback).
- `index.html`: `<link rel="icon" type="image/svg+xml" href="/favicon.svg" />`

---

## 8. Agent Rules

1. **Never override a LOCKED token.** If a change is needed, open a MR that updates this file first.
2. **All colors must reference CSS custom properties** (`var(--color-bg)` etc.), never hardcoded hex values in component files.
3. **All motion must check `prefers-reduced-motion`** before applying transforms.
4. **The entrance sequence runs once per session.** Store completion in `sessionStorage` key `boot_complete`. On revisit within session, skip to Stage 4 (page reveal only, 300ms total).
5. **No external animation libraries required.** Implement all motion in vanilla CSS transitions + `requestAnimationFrame`. Framer Motion is permitted if already in the dependency tree but must not be added solely for this.
6. **Particles must degrade gracefully.** If `canvas` is not supported, skip Stage 3 silently.
7. **Typography:** Load Inter and JetBrains Mono via `<link rel="preconnect">` + Google Fonts in `index.html`. Subset to Latin only.
8. **No cyan, no violet, no pure black, no pure white.** PR reviewers should reject any component using these.
9. **Issue #16 (real content) is a separate MR.** Do not block section implementation on content — use the placeholder copy from v1 specs until #16 lands.
10. **The `/contact` social links arrow bug** (`&nearr;` rendering as literal text) must be fixed in the same MR as the `/contact` section v2 rebuild.
