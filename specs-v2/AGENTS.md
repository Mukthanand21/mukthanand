# AGENTS.md
> **v2 — This file supersedes all previous versions of AGENTS.md.**
> Read this file completely before touching any file in the repo.
> It is the single source of truth for every agent and contributor.

---

## 1. Project Vision

A personal portfolio for **Mukthanand Reddy** framed as a **running production system**.

The visitor is not browsing a CV — they are **accessing a live service**. Pages are endpoints. The entrance is a system boot. Data is rendered as system output. This metaphor is the structure, the content, and the visual language — not a skin applied on top.

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

content/            ← Real data files (populated via issue #16). NOT YET COMPLETE.
                       Use placeholder copy from v1 until #16 lands.
```

**Before building any section: read `specs-v2/000-overview.md` in full, then the relevant section spec.**

> All v1 specs (`specs/`) are deprecated. Do not reference them.

---

## 3. Design System (LOCKED — specs-v2/000-overview.md)

Do not read this section as a substitute for `000-overview.md`. This is a summary only.

### Colors
| Token | Value |
|---|---|
| `--color-bg` | `#2E1F2E` (deep plum) |
| `--color-bg-elevated` | `#3D2A3D` |
| `--color-bg-subtle` | `#4D3A4D` |
| `--color-accent` | `#E8B65A` (gold) |
| `--color-accent-dim` | `#A87E35` |
| `--color-text-primary` | `#F3EAEF` |
| `--color-text-secondary` | `#B79CAE` |
| `--color-text-muted` | `#6B4D6B` |
| `--color-success` | `#A8C3A0` |
| `--color-border` | `#3D2A3D` |

**Hard rules: No cyan. No violet. No pure black. No pure white. No gradients on background.**

### Typography
- Display + Body: `Inter` (700 display, 400–500 body)
- Mono: `JetBrains Mono` (labels, tags, slugs, ticker, version strings)
- All sizing via tokens defined in `000-overview.md`. Never hardcode `px` values in components.

### Motion
- Entrance: full cinematic 4-stage boot sequence. Spec in `000-overview.md` §4.1. Non-negotiable.
- Scroll: `IntersectionObserver` stagger reveals. Spec in §4.2.
- Hover: defined per-component in §4.3.
- All motion must respect `prefers-reduced-motion`.
- No Framer Motion. No Lenis. Vanilla CSS transitions + `requestAnimationFrame` only.

---

## 4. Tech Stack (LOCKED)

| Layer | Choice |
|---|---|
| Framework | React + Vite + TypeScript |
| Styling | Tailwind CSS + CSS custom properties for all design tokens |
| Animation | Vanilla CSS transitions + `requestAnimationFrame` (no Framer Motion, no GSAP) |
| Scroll | Native smooth scroll (`scroll-behavior: smooth`) — no Lenis |
| Fonts | Inter + JetBrains Mono via Google Fonts (preconnect + subset Latin) |
| Contact form | Formspree or Web3Forms (static, no backend) |
| Deploy | GitLab CI/CD → GitLab Pages |

> If you believe a library is genuinely needed, open an issue and discuss before adding it.
> Do not add dependencies unilaterally.

---

## 5. Sections

| Route | Label | Issue |
|---|---|---|
| `/status` | Hero — who, availability, current focus | #6 |
| `/services` | Projects as API services | #7 |
| `/changelog` | Experience as semver timeline | #8 |
| `/stack` | Skills grouped by discipline | #9 |
| `/contact` | POST /hire form + links | #10 |

Content for all sections is placeholder until issue **#16** lands.
Issue #16 must not block section builds — build structure first, content second.

---

## 6. Known Bugs — Fix in Same MR as Section Rebuild

| Bug | Section | Fix |
|---|---|---|
| `&nearr;` rendering as literal HTML entity on social links | `/contact` (#10) | Use Unicode `→` or `↗` directly in JSX, not HTML entity |

---

## 7. Repo Conventions

- **Conventional commits:** `feat:`, `fix:`, `chore:`, `docs:`, `style:`, `refactor:`
- **One branch per issue:** `type/issue-<iid>-short-slug` (e.g. `feat/issue-6-status-v2`)
- **One MR per branch.** Reference the issue in the MR description.
- **All colors via CSS custom properties.** Never hardcode hex values in component files. PRs with hardcoded hex will be rejected.
- **All tokens defined once** in `src/styles/tokens.css` (or equivalent). Import everywhere else.
- **Accessibility:** WCAG AA contrast minimum. All interactive elements keyboard-navigable. Acceptance criterion on every section MR.
- **Lighthouse:** ≥90 performance, ≥90 accessibility on every MR before merge.

---

## 8. Agent Collaboration Rules

1. **Read `specs-v2/000-overview.md` before any work.** No exceptions.
2. **Pick one issue. One branch. One MR.** Do not bundle multiple sections.
3. **Foundation first.** The following must land before any section issue begins:
   - CSS token file (`src/styles/tokens.css`) with all `--color-*`, `--text-*`, `--ease-*` tokens
   - Font setup (`index.html` preconnect + Google Fonts link for Inter + JetBrains Mono)
   - Entrance animation component (`src/components/BootLoader.tsx`) — shared, built once
   - Nav component (`src/components/Nav.tsx`) — shared, built once
   - Ticker component (`src/components/Ticker.tsx`) — shared, built once
4. **Section issues are independent** once foundation is merged. They can be built in parallel.
5. **Do not modify `specs-v2/000-overview.md` or this file** without a dedicated MR that touches only those files and has a clear reason in the description.
6. **Do not reference `specs/` (v1 specs).** They are deprecated.
7. **Content files in `content/` are read-only until #16 is merged.** Do not create or modify them as part of section MRs.
8. **The entrance boot sequence (`BootLoader.tsx`) runs on every page load.** No session memory. The full cinematic sequence plays each time. `prefers-reduced-motion` triggers a 300ms quick reveal.
9. **Particle burst in Stage 3** must degrade gracefully — wrap in `try/catch` and skip silently if `canvas` is unavailable.
10. **Never add a dependency without an issue.** `package.json` changes require explicit approval via issue comment before the MR is opened.

---

## 9. Definition of Done (per section MR)

A section MR is ready to merge when all of the following are true:

- [ ] Section renders correctly at 375px, 768px, 1280px viewport widths
- [ ] All colors use `var(--color-*)` tokens — zero hardcoded hex
- [ ] All font sizes use `var(--text-*)` tokens
- [ ] Scroll reveal animation fires correctly on entry
- [ ] `prefers-reduced-motion` disables transforms (opacity fade only)
- [ ] Keyboard navigation works (tab order logical, focus visible)
- [ ] WCAG AA contrast passes on all text
- [ ] No `console.error` or `console.warn` in production build
- [ ] Lighthouse ≥90 performance and ≥90 accessibility
- [ ] MR references the issue number
- [ ] Conventional commit message on every commit in the branch
