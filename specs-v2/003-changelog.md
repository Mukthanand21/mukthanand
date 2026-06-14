# specs-v2 / 003 — /changelog (Experience Timeline)

## Purpose
Present the journey — internship, projects, milestones — as a semver changelog.
Not a resume. Not a list of job titles. A commit history of becoming an engineer.
The format signals: this person thinks in systems, ships incrementally, and documents their work.

---

## Layout

Section slug + title, then a vertical scrollable timeline.
Single column. Timeline line runs down the left side.

```
/changelog

  A record of builds, shipped features, and lessons learned.

  │
  ●  v2.0.0  —  Jun 2026
  │  Graduation Release
  │  [description]
  │
  ●  v1.4.0  —  Apr 2026
  │  Added RAG retrieval to corpus.swecha.org
  │  [description]
  │
  ●  v1.3.0  —  Mar 2026
  │  ...
  │
  ...
```

---

## Timeline Entry Anatomy

```
●  [version]  —  [date]            ← dot + version + date on same row
   [title]                         ← what shipped / what happened
   [description]                   ← 1–3 sentences, honest
   [tags]                          ← optional: repo, event, team
```

### Fields
- **Timeline dot:** `8px` circle, `--color-accent`. Line: `1px solid --color-border`, runs full height.
- **Version:** mono, `--text-xs`, `--color-accent`, uppercase. e.g. `v1.4.0`
- **Date:** mono, `--text-xs`, `--color-text-muted`. e.g. `APR 2026`
- **Title:** `--text-lg`, weight 600, `--color-text-primary`. The "what shipped."
- **Description:** `--text-sm`, `--color-text-secondary`, line-height 1.6. Honest — what you specifically did.
- **Tags:** same pill style as `/services` tech tags. Use for: repo name, event name, team context.

### Versioning convention
- `vX.0.0` — Major: internship start, graduation, significant role change
- `vX.Y.0` — Minor: shipped feature, completed project, hackathon
- `vX.Y.Z` — Patch: fix, small contribution, learning milestone

---

## Changelog Entries (placeholder until #16)

| Version | Date | Title |
|---|---|---|
| v2.0.0 | Jun 2026 | Graduation Release — B.Tech CSE, ICFAI Tech Hyderabad |
| v1.5.0 | May 2026 | Shipped internship report — Knowledge-Graph-Augmented Hybrid Retrieval |
| v1.4.0 | Apr 2026 | Merged feat/rag — hybrid retrieval live on corpus.swecha.org |
| v1.3.0 | Mar 2026 | Scheme Saathi — Telugu-first Telegram bot, Aarna/Swecha Hackathon |
| v1.2.0 | Feb 2026 | Joined Viswam AI as Software & AI Intern — IIIT Hyderabad initiative |
| v1.1.0 | Jan 2026 | FAQSense — RAG FAQ assistant, Streamlit Cloud |
| v1.0.0 | Aug 2025 | First production deploy — Paste & Fix Agent with Groq |
| v0.1.0 | Jun 2022 | Enrolled — B.Tech Computer Science & Engineering |

---

## Scroll Animation
Entries reveal from bottom as user scrolls.
Each entry: `translateY(16px→0)` + `opacity(0→1)`, `400ms`, `--ease-spring`.
Stagger: 60ms between entries.
Timeline line draws downward progressively as entries appear (CSS `height` animation on `::after` pseudo-element of the line).

---

## Acceptance Criteria
- [ ] Timeline line is vertically continuous — no gaps between entries
- [ ] Version + date are always on the same row, never stacking on 375px (reduce font size if needed, never wrap)
- [ ] Major versions (`vX.0.0`) are visually distinct — larger dot (`12px`), title slightly larger (`--text-xl`)
- [ ] Entries are ordered newest-first (descending)
- [ ] Placeholder entries must be replaced entirely by #16 — no mixing of placeholder and real data
