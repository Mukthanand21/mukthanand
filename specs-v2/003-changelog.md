# specs-v2 / 003 — /changelog (Experience Timeline)

## Purpose
Present the journey — internships, projects, milestones — as a semver changelog. A record of builds, shipped features, and lessons learned.

## Layout
Section slug + description, then a vertical scrollable timeline. Single column. Gold dots with connecting gradient line down the left.

## Timeline Entry Anatomy
- **Dot:** Accent circle with pulsing glow ring. Major versions (`vX.0.0`) get larger dots.
- **Connecting line:** Gradient from gold to border, runs between entries.
- **Version:** Mono, accent, uppercase
- **Date:** Mono, muted
- **Title:** Section heading, transitions to accent on hover
- **Description:** 1–3 sentences, honest
- **Tags:** Pill-style, same as service tech tags

## Entries
| Version | Date | Title |
|---|---|---|
| v2.0.0 | JUN 2026 | Graduation Release |
| v1.4.0 | APR 2026 | Ask Your Corpus — Hybrid RAG Live |
| v1.3.0 | MAR 2026 | Scheme Saathi — 48hr Hackathon Ship |
| v1.2.0 | FEB 2026 | EHRS Contributions — Healthcare Platform |
| v1.1.0 | JAN 2026 | Joined Viswam AI — FAQSense Shipped |
| v1.0.0 | JUN 2024 | First Open Source Contribution — Skillbanc |

## Scroll Animation
Entries reveal via `<Reveal>` component — staggered 60ms. Timeline line draws continuously via CSS.

## Acceptance
- [ ] Timeline line is vertically continuous — no gaps
- [ ] Version + date always on same row
- [ ] Major versions visually distinct (larger dot, larger title)
- [ ] Newest-first order
