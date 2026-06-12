# Spec 000  Overview

This project is spec-driven. Each section has its own spec file. Build only what a spec describes; if something is ambiguous, update the spec via an MR first.

## Information architecture
- `/status`  hero
- `/services`  projects as services
- `/changelog`  experience timeline (semver style)
- `/stack`  skills
- `/contact`  POST /hire form

## Global acceptance criteria (apply to every section)
- Uses only design tokens (no hardcoded color/spacing/font values).
- Respects `prefers-reduced-motion`.
- Meets WCAG AA contrast.
- Responsive from 320px to large desktop.
- No layout shift; Lighthouse performance >= 90.
