# AGENTS.md
> **v3 — This file supersedes all previous versions of AGENTS.md.**
> Read this file completely before touching any file in the repo.
> It is the single source of truth for every agent and contributor.

---

## 1. Project Vision

A personal portfolio for **Mukthanand Reddy** framed as a **luxury editorial experience / digital atelier**.

The visitor is not browsing a CV or accessing a terminal — they are entering a **curated visual experience**. The multilingual script cycling → English lock is the hero moment. Gold on deep black is the signature palette. Every interaction should feel fluid, cinematic, and premium.

Target roles: SDE, Backend, Full-Stack (primary). AI / RAG / Applied AI (secondary).

---

## 2. Spec Hierarchy

```
specs-v2/
  000-overview.md   ← Design system, tokens, motion language. LOCKED. Read first.
  001-status.md     ← /status section spec
  002-services.md   ← /services section spec
  003-changelog.md  ← /changelog section spec
  004-stack.md      ← /stack section spec
  005-contact.md    ← /contact section spec

content/            ← Real data files. NOT YET COMPLETE until issue #16 lands.
```

**Before building any section: read `specs-v2/000-overview.md` in full, then the relevant section spec.**

> All v1 specs (`specs/`) are deprecated. Do not reference them.

---

## 3. Design System (LOCKED — specs-v2/000-overview.md)

Do not read this section as a substitute for `000-overview.md`. This is a summary only.

### Colors
| Token | Value |
|---|---|
| `--color-bg` | `#0A0A0A` (deep black) |
| `--color-bg-elevated` | `#111111` |
| `--color-bg-subtle` | `#1A1A1A` |
| `--color-accent` | `#E8B65A` (gold) |
| `--color-accent-dim` | `#A87E35` |
| `--color-text-primary` | `#F3EAEF` (warm off-white) |
| `--color-text-secondary` | `#B79CAE` |
| `--color-text-muted` | `#6B4D6B` |
| `--color-success` | `#A8C3A0` |
| `--color-border` | `#1A1A1A` |

**Hard rules: No cyan. No violet. No pure black. No pure white.**

### Typography
- **Display**: `Cabinet Grotesk` (700–800) — hero name, section titles, large numbers
- **Body + UI**: `Inter` (400–500) — descriptions, paragraphs, labels, nav
- **No JetBrains Mono.** Use Inter with letter-spacing for labels and tags. JetBrains Mono is permitted only for code snippets in project descriptions, never for UI chrome.
- All sizing via tokens defined in `000-overview.md`. Never hardcode `px` values in components.

### Motion
- **Entrance**: Cinematic boot — multilingual script cycling on black → gold lock → glow → dramatic mask reveal into site. No text, no particles, no progress bar. Spec in `000-overview.md` §4.1.
- **Scroll**: GSAP + Lenis with synchronized tickers. ScrollTrigger for reveal animations. No IntersectionObserver.
- **Hover**: Magnetic UI for nav items. WebGL distortion for project card images. Defined per-component in §4.3.
- All motion must respect `prefers-reduced-motion`.
- **Animation stack**: GSAP (primary) + Lenis (scroll) + R3F (WebGL effects). Framer Motion is deprecated for new work.

---

## 4. Tech Stack (LOCKED)

| Layer | Choice |
|---|---|
| Framework | React + Vite + TypeScript |
| Styling | Tailwind CSS + CSS custom properties for all design tokens |
| Animation (primary) | GSAP + ScrollTrigger + CustomEase |
| Scroll | Lenis (`@studio-freight/react-lenis`) — physics-based smooth scrolling |
| WebGL | React Three Fiber (`three`, `@react-three/fiber`, `@react-three/drei`) |
| Fonts | Cabinet Grotesk via Fontshare CDN + Inter via Google Fonts |
| Contact form | Formspree or Web3Forms (static, no backend) |
| Deploy | GitLab CI/CD → GitLab Pages |

> **Dependency rule:** GSAP, Lenis, and R3F are pre-approved for V3. Any new dependency beyond these requires an issue and discussion.

---

## 5. Sections

| Route | Label | Issue |
|---|---|---|
| `/status` | Hero — identity, availability, focus | #6 |
| `/services` | Projects presented as premium case studies | #7 |
| `/changelog` | Experience as editorial timeline | #8 |
| `/stack` | Skills — physics-based constellation (V3) or grouped list (V2) | #9 |
| `/contact` | Contact form + social links | #10 |

Content for all sections is placeholder until issue **#16** lands.

---

## 6. Repo Conventions

- **Conventional commits:** `feat:`, `fix:`, `chore:`, `docs:`, `style:`, `refactor:`
- **V3 workflow:** All V3 work branches from `v3`. Each issue → its own branch off `v3` → MR merges into `v3` only. Finalize `v3` then merge into `main`.
- **All colors via CSS custom properties.** Never hardcode hex values in component files.
- **All tokens defined once** in `src/styles/tokens.css`. Import everywhere else.
- **Accessibility:** WCAG AA contrast minimum. All interactive elements keyboard-navigable.
- **Lighthouse:** ≥90 performance, ≥90 accessibility.
- **No terminal tropes:** No `● OPERATIONAL`, no `SESSION:` counters, no `INITIALIZING...` text, no progress bars with percentages. The bootloader is cinematic, not a system status screen.

---

## 7. Agent Collaboration Rules

1. **Read `specs-v2/000-overview.md` before any work.** No exceptions.
2. **Pick one issue. One branch off `v3`. One MR into `v3`.** Do not bundle multiple issues.
3. **V3 Foundation (issue #27) must land first.** It supersedes all V2 lock rules.
4. **Section issues are independent** once foundation is merged. They can be built in parallel on the `v3` branch.
5. **Do not modify `specs-v2/000-overview.md` or this file** without a dedicated MR with clear reasoning.
6. **Do not reference `specs/` (v1 specs).** They are deprecated.
7. **Content files in `content/` are read-only until #16 is merged.** Do not create or modify them as part of section MRs.
8. **The entrance boot sequence runs on every page load.** No session memory. `prefers-reduced-motion` triggers a 300ms quick reveal.
9. **Never add an unapproved dependency.** GSAP, Lenis, and R3F are pre-approved for V3. Everything else needs an issue.
10. **No terminal tropes.** Every component should read as luxury editorial, not a server dashboard. Reject PRs that reintroduce `●` indicators, `SESSION:` labels, or system-status language in UI chrome.

---

## 8. Definition of Done (per section MR)

A section MR is ready to merge when all of the following are true:

- [ ] Section renders correctly at 375px, 768px, 1280px viewport widths
- [ ] All colors use `var(--color-*)` tokens — zero hardcoded hex
- [ ] All font sizes use `var(--text-*)` tokens
- [ ] Scroll reveal animation fires correctly on entry (GSAP ScrollTrigger)
- [ ] Lenis scrolling is smooth with no jitter
- [ ] `prefers-reduced-motion` disables transforms (opacity fade only)
- [ ] Keyboard navigation works (tab order logical, focus visible)
- [ ] WCAG AA contrast passes on all text
- [ ] No console errors or warnings in production build
- [ ] Lighthouse ≥90 performance and ≥90 accessibility
- [ ] No terminal tropes — no `●`, no `SESSION:`, no `OPERATIONAL`, no uppercase-mono nav links
- [ ] MR references the issue number
- [ ] Conventional commit message on every commit in the branch
