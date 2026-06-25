# TRACKING.md — Scroll Architecture Implementation

> **Branch:** `feat/scroll-single-page`
> **Base:** `main` (commit `816c411`)
> **Status:** ✅ Implementation complete — all scroll features built and typechecked
>
> Read this file first for context on what was implemented, what's pending, and how to continue.

---

## 1. What Was Implemented

### 1.1 Single-Page Scroll Architecture (Core)

| File | Type | Purpose |
|---|---|---|
| `src/hooks/useScrollSpy.ts` | 🆕 New | IntersectionObserver hook with rAF batching — tracks which section is in the viewport |
| `src/pages/IndexPage.tsx` | 🆕 New | Single page rendering all 5 sections inline + ambient glow + transition overlays |
| `src/motion/useSectionTransition.ts` | 🆕 New | GSAP ScrollTrigger hook — per-section entrance (label/desc/meta stagger) |
| `src/motion/useSectionTransitions.ts` | 🆕 New | GSAP ScrollTrigger hook — between-section cinematic overlays |

### 1.2 Modified Files

| File | Change |
|---|---|
| `src/router.tsx` | Index ⇒ `/status` redirect; deep-link routes scroll via Lenis after boot |
| `src/components/Layout.tsx` | Removed Framer Motion route transitions; removed `max-w-content` constraint from `<main>` |
| `src/components/Nav.tsx` | NavLink ⇒ scroll buttons + `useScrollSpy` active tracking + morphing pill ("3 running" → "hire me") + 404 hash fallback |
| `src/components/Footer.tsx` | Links use Lenis `scrollTo` instead of native `scrollIntoView` |
| `src/components/RackScene.tsx` | Added `id="rack-scene-container"` for GSAP rack-exit transition targeting |

### 1.3 Section Component + Data Attributes

| File | Change |
|---|---|
| `src/components/Section.tsx` | Full-bleed 100vw wrapper + grain overlay (`opacity: 0.02`) + `useSectionTransition` integration |
| `src/sections/Status.tsx` | Removed `-mx-gutter` (no longer needed with full-bleed sections) |
| `src/sections/Services.tsx` | Added `data-section-card` for transition animation |
| `src/sections/Changelog.tsx` | Added `data-section-card` on timeline entries |
| `src/sections/Stack.tsx` | Added `data-section-card` wrapper around skill cards |
| `src/sections/Contact.tsx` | Added `data-section-card` on inner div (not on `<Reveal>` — doesn't spread unknown props) |

### 1.4 Between-Section Transitions

| Transition | From → To | Effect | File |
|---|---|---|---|
| `rack-exit` | status → services | 3D rack slides left (−40vw, scale 0.95, fade) → gold sweep → service cards slide in | `useSectionTransitions` |
| `gold-sweep` | services → changelog, stack → contact | Gold horizontal bar (`#transition-sweep-*`) sweeps across | `useSectionTransitions` |
| `iris-wipe` | changelog → stack | Clip-path circle grows from center to reveal | `useSectionTransitions` |
| `parallax-shift` | stack → contact | Subtle skew + scale shift | `useSectionTransitions` |

All transitions are:
- Scroll-scrubbed via GSAP ScrollTrigger (`scrub: 1.2`)
- Disabled on mobile (<768px) and `prefers-reduced-motion`
- Registered via `TRANSITIONS` array in IndexPage

### 1.5 Ambient Effects

- **Ambient glow** — radial gold gradient (`rgba(245,208,112, 0.035)`) follows active section position via GSAP `power2.out`
- **Grain overlay** — SVG noise filter on each `<Section>` component (`opacity: 0.02`)

---

## 2. Updated Documentation

The following docs were updated to reflect the new scroll architecture:

| File | What Changed |
|---|---|
| `AGENTS.md` | Updated with single-page scroll architecture, section table, motion language, tech stack, architecture diagram, all new components |
| `specs-v2/000-overview.md` | Updated with scroll architecture, motion language, per-section entrances, between-section transitions, ambient elements, easing tokens, layout rules, shared components, acceptance criteria |

---

## 3. Architecture Decisions

### Why GSAP over Framer Motion for section transitions?
- ScrollTrigger provides native scroll-linked progress (scrub) — Framer Motion's `useScroll` + `useTransform` is less robust for multi-phase timeline sequencing.
- GSAP timelines allow precise choreography of multiple elements (rack + sweep + cards) with staggered offsets.
- Framer Motion retained ONLY for Stack tab layout animations (sidebar + panel transitions).

### Why full-bleed sections with constrained inner content?
- Creates visual continuity with the hero (Status) which was already full-bleed.
- Prevents the "boxed-in" feel of earlier iterations where sections felt disconnected from the theme.
- Grain overlay on every section provides atmospheric continuity.

### Why remove route transitions?
- Single-page architecture means no route transitions to animate. Section transitions are scroll-triggered, not route-triggered.
- Removes Framer Motion `AnimatePresence` complexity from Layout.

---

## 4. Known Issues / What's Missing

### 🐛 Rack scene not rendering
- Status: Needs investigation
- The 3D server rack (React Three Fiber) scene behind the hero section is not appearing visually
- Possible causes: Three.js import issue, R3F canvas mount issue, camera positioning, or boot loader overlay not fully revealing
- Suggested next step: Debug `RackScene.tsx` and `useRackScene.ts` — check Canvas mount, Three.js version compatibility, console errors

### 🔜 Suggested Next Phases

1. **Debug rack scene** — Fix the 3D rack rendering issue (most impactful for the signature visual)
2. **Rack transition polish** — The rack→cards morph needs refinement: smoother rack exit trajectory, card entrance easing, responsive adjustment
3. **Service card entrance stagger** — The `data-section-card` attribute exists but the GSAP stagger was removed to avoid conflict with `Reveal` component. Implement a non-conflicting entrance animation.
4. **Transition polish** — Tune GSAP curve durations for each transition type. Current curves are functional but not cinematic.
5. **Mobile responsive audit** — Check all sections at 375px, 768px, 1024px. Section padding, font sizes, card layouts.
6. **Content finalization** — Replace placeholder text with final copy across all sections (blocked on issue #16).
7. **Performance optimization** — GSAP ScrollTrigger `invalidateOnRefresh`, Lenis RAF integration, R3F renderer optimization.
8. **Testing** — Add Cypress or Playwright tests for scroll behavior, deep-linking, nav interaction.

---

## 5. How to Continue

```bash
# Checkout the branch
git checkout feat/scroll-single-page

# Start dev server
npm run dev

# Typecheck
npx tsc --noEmit

# Build
npm run build
```

### Key Files to Know

| File | Why It Matters |
|---|---|
| `src/pages/IndexPage.tsx` | Central orchestration — all sections, transitions, ambient glow. Most important file. |
| `src/motion/useSectionTransition.ts` | Per-section entrance hook. Edit to tune label/desc/meta stagger timing. |
| `src/motion/useSectionTransitions.ts` | Between-section overlays hook. Edit to tune transition curves or add new types. |
| `src/motion/useRackScrollDirector.ts` | (New) Rack scroll coordination. Edit to adjust rack→card morph timing. |
| `src/motion/rackChapters.ts` | (New) Rack chapter definitions. |
| `src/motion/rackDirector.ts` | (New) Rack animation director. |
| `src/components/Section.tsx` | Full-bleed wrapper. Edit to adjust grain intensity or entrance defaults. |
| `src/hooks/useScrollSpy.ts` | Scroll tracking hook. Edit to adjust IntersectionObserver thresholds. |

### Linting / Style

- Conventional commits: `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `chore:`
- Colors: always use CSS custom properties from `tokens.css`
- No hardcoded hex values, no pure black/white
- No terminal tropes in UI (cinematic, not diagnostic)
