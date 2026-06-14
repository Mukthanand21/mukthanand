# specs-v2 / 001 — /status (Hero)

## Purpose
The first thing a visitor sees after the boot sequence resolves.
Must answer three questions in under 3 seconds:
1. Who is this person?
2. Are they available?
3. What are they working on right now?

---

## Layout

Two-column grid. Left: identity. Right: live status sidebar.
Collapses to single column below 768px (sidebar moves below identity).

```
┌─────────────────────────────┬──────────────────────┐
│  v2.0.0 — FINAL YEAR BUILD  │  CURRENT STATUS      │
│                             │  ─────────────────── │
│  Mukthanand                 │  Hybrid RAG retrieval │
│  Reddy.          (gold)     │  corpus.swecha.org   │
│                             │                      │
│  [description]              │  LAST DEPLOYED       │
│                             │  v1.4.0              │
│  [CTA]  [secondary]         │  feat/rag → main     │
│                             │                      │
│                             │  AVAILABILITY        │
│                             │  ● Open to roles     │
└─────────────────────────────┴──────────────────────┘
```

---

## Content

### Identity block (left)
- **Version tag:** `v2.0.0 — FINAL YEAR BUILD` — mono, `--color-accent`, `--text-xs`, uppercase
- **Name line 1:** `Mukthanand` — `--text-hero`, weight 700, `--color-text-primary`
- **Name line 2:** `Reddy.` — `--text-hero`, weight 700, `--color-accent` (gold)
- **Description:** 1–2 sentences. Placeholder until #16 lands.
  > `Backend & full-stack engineer. Builds retrieval systems, agentic tooling, and tools for underserved communities.`
- **Primary CTA:** `view services →` — gold filled button
- **Secondary CTA:** `read changelog` — outline button

### Status sidebar (right)
Separated from identity by `0.5px solid --color-border` left border.

Three status blocks, each with:
- Label: mono, `--text-xs`, `--color-text-muted`, uppercase, letter-spacing `0.1em`
- Value: `--text-md`, `--color-text-primary`
- Sub-value: `--text-sm`, `--color-text-secondary`

Blocks:
1. **CURRENT STATUS** → value: `Hybrid RAG retrieval` / sub: `corpus.swecha.org — in progress`
2. **LAST DEPLOYED** → value: `v1.4.0` / sub: `feat/rag merged to main`
3. **AVAILABILITY** → value: `● Open to roles — Jun 2026` (dot color: `--color-success`)

---

## Entrance Animation
This section is revealed by the boot sequence (`BootLoader.tsx`) — **do not add a separate entrance animation here.** The `BootLoader` handles all Stage 4 reveals for `/status`.

Refer to `000-overview.md` §4.1 Stage 4 for exact timing.

---

## Scroll Below Hero
Below the two-column hero: the **ticker** component (`Ticker.tsx`).
Below the ticker: **3 project preview cards** (same cards as `/services`, condensed).

Card order: Ask Your Corpus → Scheme Saathi → FAQSense.
Each card: method badge, title, one-line description, footer meta.
Full spec in `002-services.md`.

---

## Acceptance Criteria
- [ ] Name renders at `clamp(52px, 8vw, 88px)` — never wraps to 3 lines on 375px
- [ ] Sidebar is hidden on mobile, stacks below identity block
- [ ] Availability dot (`--color-success`) is visible and distinct from accent gold
- [ ] CTA buttons match hover spec in `000-overview.md` §4.3
- [ ] No entrance animation code in this component — delegate to `BootLoader`
