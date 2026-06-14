# specs-v2 / 002 — /services (Projects as Services)

## Purpose
Present real projects as running API services.
Honest scoping is mandatory — contributions to shared repos must be described accurately.
A recruiter should understand: what it does, what you specifically built, and whether it's live.

---

## Layout

Section slug + title, then a vertical list of service cards.
Each card is full-width (not a grid) — services are read top to bottom like an API reference.

```
/services

  Services I've shipped or contributed to.

  ┌──────────────────────────────────────────────────────┐
  │  POST /retrieve          ● live                      │
  │  Ask Your Corpus                                     │
  │  [description]                                       │
  │  [tech tags]                          corpus.swecha →│
  └──────────────────────────────────────────────────────┘

  ┌──────────────────────────────────────────────────────┐
  │  POST /chat              ● live                      │
  │  Scheme Saathi                                       │
  │  ...                                                 │
  └──────────────────────────────────────────────────────┘

  ... (more cards)
```

---

## Service Card Anatomy

```
┌─────────────────────────────────────────────────────────┐
│  [METHOD /path]    [status dot + label]                 │
│  [Service name]                                 [link →]│
│                                                         │
│  [Description — 2–3 sentences, honest scoping]         │
│                                                         │
│  [tag] [tag] [tag]                                      │
└─────────────────────────────────────────────────────────┘
```

### Fields
- **Method badge:** `POST /retrieve` — mono, `--text-xs`, background `--color-bg`, border `0.5px solid --color-border`, color `--color-accent`. Uppercase.
- **Status:** `● live` or `● in progress` or `● archived` — mono, `--text-xs`. Colors: live=`--color-success`, in-progress=`#E8B65A` (accent), archived=`--color-text-muted`.
- **Service name:** `--text-xl`, weight 600, `--color-text-primary`.
- **Link:** top-right, mono, `--text-xs`, `--color-text-muted`. On hover: `--color-accent`. Opens in new tab.
- **Description:** `--text-md`, `--color-text-secondary`, line-height 1.6. Max 3 sentences. Must describe actual contribution, not just what the project does.
- **Tech tags:** pill-shaped, `--text-xs`, mono, background `--color-bg-elevated`, color `--color-text-muted`, border `0.5px solid --color-border`. No hover state.

---

## Services List (placeholder until #16)

Use this order and placeholder data. #16 will supply final copy.

| # | Method | Path | Name | Status | Link |
|---|---|---|---|---|---|
| 1 | POST | /retrieve | Ask Your Corpus | live | corpus.swecha.org |
| 2 | POST | /chat | Scheme Saathi | live | @scheme_saathi_bot |
| 3 | GET | /faq | FAQSense | live | streamlit cloud |
| 4 | GET | /errors | Paste & Fix Agent | archived | — |
| 5 | POST | /transcribe | Corpus Audio Pipeline | archived | — |

---

## Scroll Animation
Cards reveal on scroll entry: `translateY(20px→0)` + `opacity(0→1)`, `500ms`, `--ease-spring`.
Stagger: 80ms between cards.
Each card animates once only.

---

## Hover on Cards
- `border-color` → `--color-bg-subtle`
- `background` → `#453050`
- Transition: `150ms ease`
- No scale transform

---

## Acceptance Criteria
- [ ] Method badge and status are on the same row, never wrapping on 375px
- [ ] All links open in new tab with `rel="noopener noreferrer"`
- [ ] Archived services are visually de-emphasised (muted status dot, slightly lower opacity on card — `0.7`)
- [ ] Honest scoping: description must not claim solo authorship of shared-repo work
- [ ] Tech tags do not overflow card on mobile — wrap to next line cleanly
