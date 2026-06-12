# AGENTS.md

> Read this file first. It is the single source of truth for how to build and contribute to this project. Every agent (and human) must follow these rules so that parallel work stays consistent.

## 1. Project Vision

A personal portfolio for **Mukthanand Reddy** framed as a **production system / status page**. It is NOT a person listing skills; it is a system with status, services, a changelog, a stack, and a contact endpoint.

The metaphor is the **structure**, not a cheap terminal skin. The visual skin is a **premium, dark, editorial** look. Think high-end studio site, not a dev-tool screenshot.

Target roles: SDE, Backend, Full-Stack (primary); AI / RAG / Applied AI (secondary).

## 2. Sections (visible nav, system-style labels)

- `/status`  Hero. Who I am, availability, current "build version" (Graduation Release), active focus. Signature animated moment lives here.
- `/services`  Projects presented as running API services (method badges, description, live demo link). Honest scoping (e.g. contributions to shared apps must be described accurately).
- `/changelog`  Journey/experience as a semver-style changelog, dated, scrollable.
- `/stack`  Skills grouped (Languages / Backend / Frontend / DevOps / AI). Beautifully typeset. No skill bars, no bubble charts.
- `/contact`  A `POST /hire` styled form (static submission). Clean, not gimmicky.

## 3. Design System (LOCKED  do not deviate)

### Color
- Background: `#0A0A0A` (base), `#111111` (alt), surfaces `#1A1A1A`.
- **Single hero accent: Cyan `#22D3EE`.** This is the only decorative accent.
- Semantic/status colors  used ONLY for functional signals, never decoration:
  - Live / success: Soft Green `#4ADE80`
  - Versions / headings emphasis: Violet `#A855F7` (use sparingly)
  - In-progress / warning: Amber `#F59E0B`
- Neutrals: a disciplined gray ramp on dark. High contrast for text (WCAG AA min).

### Type
- **General Sans**  primary workhorse (body + UI). Self-hosted.
- **JetBrains Mono**  code, version tags, status/terminal texture only.
- **Clash Display**  giant section titles ONLY, used very sparingly.
- Extreme size contrast: huge headings (clamp up to ~80120px), calm 1618px body.

### Layout & Motion
- Strict 8px spacing scale. Massive whitespace. Everything on a grid.
- ONE motion language: spring-eased entrances via Framer Motion, smooth scroll via Lenis.
- ONE shared easing curve used everywhere (define once in tokens).
- MUST respect `prefers-reduced-motion`.
- No exotic/novel transitions. Premium = tuned timing + restraint, not variety.

## 4. Tech Stack (LOCKED)

- React + Vite + TypeScript
- Tailwind CSS (design tokens as CSS variables)
- Framer Motion (entrances, layout)
- Lenis (smooth scroll)
- Self-hosted fonts (General Sans, JetBrains Mono, Clash Display)
- Static contact form (Formspree / Web3Forms)
- GitLab CI/CD -> GitLab Pages (no backend)

## 5. Repo Conventions

- Spec-driven: every section has a spec in `specs/`. Read the relevant spec before building.
- Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, `style:`, `refactor:`).
- One branch + one MR per issue. Keep MRs small and focused.
- Design tokens live in one place; never hardcode colors/spacing/fonts in components.
- Accessibility and Lighthouse performance are acceptance criteria, not afterthoughts.

## 6. How Multiple Agents Collaborate

- Pick an issue, create a branch `type/issue-<iid>-short-slug`, open an MR, reference the issue.
- Foundation issues (scaffold, tokens, fonts, motion, CI) must land FIRST. Section issues depend on them.
- Section issues are independent and can be built in parallel once foundation is merged.
- Do not change the locked design system or tech stack without updating this file via its own MR.
