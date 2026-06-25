# AGENTS.md

> **v4 — Single source of truth.** Read this file first before any work.
> This file supersedes all previous versions of AGENTS.md and all specs in `specs/`.
> Refer to `specs-v2/` for per-section implementation details, but this file takes precedence on any conflict.

---

## 1. Project Vision

A personal portfolio for **Mukthanand Reddy** framed as a **production system / status page** with a **luxury editorial visual skin**.

The **system metaphor** is the *structure* — status, services, changelog, stack, contact endpoint.
The **visual skin** is a *premium dark editorial* look — gold on deep black, cinematic motion, gallery-like whitespace.

Think: a high-end studio site that happens to use system labels, NOT a dev-tool screenshot or terminal skin.

Target roles: SDE, Backend, Full-Stack (primary); AI / RAG / Applied AI (secondary).

---

## 2. Sections

All sections live on a **single scroll page** (`IndexPage.tsx`). There is no route-based navigation between sections — clicking a nav link smooth-scrolls to the section via Lenis. Deep-linking (e.g. `/services`) scrolls to the section after boot.

| Anchor | Label | Description |
|---|---|---|
| `#status` | Hero | Identity, availability, "build version" (Graduation Release). 3D server rack background. Signature boot sequence reveals this section. |
| `#services` | `/services` | Projects as API services — method badges, description, tech tags, live/archived status. |
| `#changelog` | `/changelog` | Journey as semver-style changelog — vertical timeline with dots, dated entries. |
| `#stack` | `/stack` | Skills grouped by discipline — tab-navigated, proficiency levels (strongest/strong/familiar). No skill bars. |
| `#contact` | `POST /hire` | Contact form (Web3Forms) + direct email + social links. |

---

## 3. Design System (LOCKED — do not deviate)

### 3.1 Colors

| Token | Value | Usage |
|---|---|---|
| `--color-bg` | `#0A0A0A` | Page background |
| `--color-bg-elevated` | `#111111` | Cards, panels, elevated surfaces |
| `--color-bg-subtle` | `#1A1A1A` | Borders, dividers, hover states |
| `--color-accent` | `#F5D070` | **Gold** — primary accent. CTAs, active nav, hero accent, bootloader lock |
| `--color-accent-dim` | `#B89442` | Dimmed gold — hover states |
| `--color-text-primary` | `#F3EAEF` | Warm off-white — headings, primary text |
| `--color-text-secondary` | `#B79CAE` | Descriptions, subtitles |
| `--color-text-muted` | `#6B4D6B` | Labels, timestamps, metadata |
| `--color-success` | `#A8C3A0` | Live status dots, operational indicators |
| `--color-border` | `#1A1A1A` | All borders and dividers |

**Hard rules:** No cyan. No violet. No pure black (`#000`) or pure white (`#FFF`). Gold is the only decorative accent — used sparingly. Semantic colors (success, amber, etc.) are for functional signals only.

### 3.2 Typography

| Role | Font | Usage |
|---|---|---|
| Display | `'Cabinet Grotesk', sans-serif` | Hero name, section titles, large numbers |
| Body / UI | `'Inter', system-ui, sans-serif` | Descriptions, paragraphs, labels, nav |
| UI labels / tags | `Inter` with `letter-spacing: 0.08em` | Method badges, version tags, mono contexts |
| Code | `'JetBrains Mono', monospace` | Inline code in descriptions, status indicators |

**Rules:**
- All sizes via `--text-*` tokens in `tokens.css` — never hardcode px in components
- Letter-spacing: `-0.03em` on display sizes, `+0.08em` on labels
- Line height: `1.0` on hero, `1.6` on body, `1.4` on card text
- No italic anywhere
- Cabinet Grotesk is the first thing the visitor reads — hero name and section headings

### 3.3 Layout & Spacing

- **Sections are full-bleed** — `100vw` width, centered via negative margin, breaking out of parent container
- Inner content constrained to `max-width: 1100px` with gutter padding
- Section padding: `py-section` (Tailwind token)
- Strict 8px spacing scale. Massive whitespace.
- Nav height: `52px`, sticky top, `bg-bg` at `90% opacity` + `backdrop-filter: blur(12px)`

### 3.4 Motion Language

#### Entrance Sequence (Cinematic Bootloader)
The boot sequence is a **film-style title sequence**, not a system boot:
1. **Black void** (0–300ms) — pure `#000`, complete silence
2. **Script cycling** (300–2500ms) — 10 letters cycle through Indian scripts, wave-like cascade
3. **Gold lock** (2500–3000ms) — letters lock to English, flash gold, settle to warm white
4. **Glow + gold line** (3000–3600ms) — underline sweeps in, name holds in full brightness
5. **Mask reveal** (3600–4800ms) — vertical iris wipe reveals the hero section beneath

All motion respects `prefers-reduced-motion` (300ms quick reveal).

#### Scroll Animations
- **Engine:** GSAP ScrollTrigger (primary). Synced with Lenis via `gsap.ticker`.
- **Per-section entrance:** `useSectionTransition` hook — reveals label, description, metadata on scroll entry via GSAP `fromTo` with spring easing
- **Between-section transitions:** `useSectionTransitions` hook — cinematic overlay effects:
  - `rack-exit`: 3D rack slides left → gold sweep → service cards slide in (status→services)
  - `gold-sweep`: Horizontal gold light bar sweeps across (services→changelog, stack→contact)
  - `iris-wipe`: Clip-path circle grows to reveal next section (changelog→stack)
  - `parallax-shift`: Subtle skew + scale transition
- **Ambient glow:** Fixed radial gold gradient that drifts to follow the active section via GSAP
- **Grain overlay:** Subtle SVG noise texture (`opacity: 0.02`) on every section for atmospheric continuity

#### Hover States
- **Cards:** Border lifts to accent, background subtly brightens, `150ms`
- **CTA button (gold):** Background `accent` → `accent-dim`, slight `translateY(-1px)`, `120ms`
- **Nav links:** Color transition to accent
- **Custom cursor:** Lens cursor morphs on interactive elements

#### Easing Tokens
| Token | Value | Usage |
|---|---|---|
| `--ease-spring` | `cubic-bezier(0.16, 1, 0.3, 1)` | UI hovers, spring-back |
| `--ease-out` | `cubic-bezier(0.0, 0, 0.2, 1)` | Fades, simple reveals |
| `--ease-cinematic` | `cubic-bezier(0.22, 1, 0.36, 1)` | Hero reveals, mask transitions |
| `--ease-linear` | `linear` | Ticker, progress fills |

---

## 4. Tech Stack (LOCKED)

| Layer | Choice |
|---|---|
| Framework | React 18 + Vite + TypeScript |
| Routing | React Router v6 (single IndexPage + 404 route) |
| Styling | Tailwind CSS + CSS custom properties (`tokens.css`) |
| Animation (primary) | GSAP + ScrollTrigger |
| Smooth scroll | Lenis (`@studio-freight/react-lenis`) |
| 3D / WebGL | React Three Fiber (`three`, `@react-three/fiber`, `@react-three/drei`) |
| Animation (limited) | Framer Motion — used ONLY in Stack.tsx for tab layout animations |
| Fonts | Inter via Google Fonts, Cabinet Grotesk via Fontshare CDN, JetBrains Mono self-hosted |
| Contact form | Web3Forms (static, no backend) |
| CI/CD | GitLab CI/CD → GitLab Pages |

---

## 5. Architecture

```
src/
├── components/       Shared UI components (Nav, Footer, Section, RackScene, etc.)
├── hooks/            Custom hooks (useScrollSpy, useRackScene, useKineticScroll, etc.)
├── motion/           Animation utilities (Reveal, ScrollProvider, useSectionTransition, etc.)
├── pages/            Page components (IndexPage — single scroll page)
├── sections/         Section components (Status, Services, Changelog, Stack, Contact)
├── styles/           Tokens, fonts, global CSS
├── data/             Static data (icon paths, etc.)
└── router.tsx        Route definitions
```

**Key architectural decisions:**
- **Single-page scroll** — All 5 sections rendered inline in `IndexPage.tsx`. Nav links use Lenis `scrollTo()` for smooth navigation.
- **Deep-linking** — `/status`, `/services`, `/changelog`, `/stack`, `/contact` routes render IndexPage and auto-scroll to the target section after boot.
- **No route transitions** — Framer Motion `<AnimatePresence>` route transitions removed. Section transitions handled by GSAP ScrollTrigger overlays.
- **404 handled separately** — renders `<NotFound />` via a standalone route.

---

## 6. Spec Hierarchy

```
AGENTS.md               ← THIS FILE. Single source of truth. Read first.
specs-v2/               ← Per-section implementation specs. V2 (current).
  000-overview.md       Design system, tokens, motion (LOCKED)
  001-status.md         /status section
  002-services.md       /services section
  003-changelog.md      /changelog section
  004-stack.md          /stack section
  005-contact.md        /contact section
specs/                  ← V1 (deprecated). Do not reference.
```

**Before building or modifying any section:**
1. Read this file (`AGENTS.md`) in full
2. Read `specs-v2/000-overview.md` for the design system
3. Read the relevant section spec in `specs-v2/`

---

## 7. Repo Conventions

- **Conventional commits:** `feat:`, `fix:`, `chore:`, `docs:`, `style:`, `refactor:`
- **All colors via CSS custom properties** — never hardcode hex in components
- **All design tokens defined once** in `src/styles/tokens.css` — components import via Tailwind or `var()`
- **Accessibility:** WCAG AA contrast minimum. All interactive elements keyboard-navigable. Skip-to-content link present.
- **Reduced motion:** All animations check `prefers-reduced-motion` — GSAP timelines skip transforms.
- **No terminal tropes:** No `● OPERATIONAL`, no `SESSION:` counters, no `INITIALIZING...` text. The bootloader is cinematic, not diagnostic.
- **New dependencies require discussion** — GSAP, Lenis, R3F, Framer Motion are pre-approved.

---

## 8. Agent Collaboration Rules

1. **Read this file first** before any work. No exceptions.
2. **`specs/` (v1) is deprecated.** Do not reference it. All authority is in `AGENTS.md` + `specs-v2/`.
3. **Single-page scroll architecture** — sections are not separate routes. Nav scrolls, doesn't navigate.
4. **Do not modify `AGENTS.md` or `specs-v2/000-overview.md`** without a dedicated MR with clear reasoning.
5. **GSAP is the primary animation engine.** Framer Motion is only for Stack tabs. Do not add new Framer Motion animations.
6. **Respect the full-bleed section layout.** Sections are `100vw` with constrained inner content. Do not add new wrapper constraints.
7. **Content is placeholder until issue #16 lands.** Do not block section work on final copy.
