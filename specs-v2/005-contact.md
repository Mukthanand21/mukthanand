# specs-v2 / 005 — /contact (POST /hire)

## Purpose
Make it easy and inviting to reach out.
Framed as an API endpoint (`POST /hire`) — consistent with the portfolio's system metaphor.
Not gimmicky — the form works, the links work, the copy is human.

---

## Layout

Two-column. Left: form. Right: direct links.
Collapses to single column (form first, links below) on mobile.

```
/contact

  POST /hire — Send a request directly,
  or reach out through any channel below.

  ┌──────────────────────────┐   DIRECT EMAIL
  │  NAME                    │   mukthanandreddy21@gmail.com ↗
  │  [input]                 │
  │                          │   SOCIAL
  │  EMAIL                   │   GitHub ↗
  │  [input]                 │   GitLab ↗
  │                          │   LinkedIn ↗
  │  MESSAGE                 │
  │  [textarea]              │
  │                          │
  │  [Send →]                │
  └──────────────────────────┘
```

---

## Form Fields

| Field | Type | Placeholder |
|---|---|---|
| NAME | text input | `Your name` |
| EMAIL | email input | `you@example.com` |
| MESSAGE | textarea (4 rows) | `What would you like to discuss?` |

- Field labels: mono, `--text-xs`, uppercase, `--color-text-muted`, letter-spacing `0.08em`
- Inputs: background `--color-bg-elevated`, border `0.5px solid --color-border`, color `--color-text-primary`, border-radius `8px`, padding `12px 14px`
- Input focus: border-color → `--color-accent`, outline none, box-shadow `0 0 0 2px rgba(232,182,90,0.2)`
- Textarea: same as input, resize vertical only
- Submit button: full-width, background `--color-accent`, color `--color-bg` (`#2E1F2E`), font-weight 600, padding `12px`, border-radius `8px`, label `Send →`
- Submit hover: background `--color-accent-dim`, `translateY(-1px)`, `120ms`

### Form submission
- Use Formspree or Web3Forms (static, no backend)
- On success: replace form with mono success message — `REQUEST_RECEIVED — I'll respond within 48h.` in `--color-success`
- On error: show `REQUEST_FAILED — try mukthanandreddy21@gmail.com` in `--color-accent`

---

## Direct Links (right column)

### DIRECT EMAIL
- `mukthanandreddy21@gmail.com` → `mailto:` link
- Arrow: `↗` (Unicode, NOT `&nearr;` HTML entity — this was the v1 bug)

### SOCIAL
| Label | URL |
|---|---|
| GitHub | https://github.com/Mukthanand21 |
| GitLab | https://code.swecha.org/Mukthanand21 |
| LinkedIn | https://linkedin.com/in/mukthanand21 |

- Label: `--text-md`, weight 500, `--color-text-primary`
- Arrow `↗`: mono, `--color-text-muted`. On hover: `--color-accent`
- All links: `target="_blank" rel="noopener noreferrer"`
- Section labels (DIRECT EMAIL, SOCIAL): mono, `--text-xs`, `--color-text-muted`, uppercase, letter-spacing `0.08em`

---

## Scroll Animation
Left form and right links reveal simultaneously on scroll entry.
Form: `translateX(-12px→0)` + `opacity(0→1)`, `500ms`, `--ease-spring`.
Links: `translateX(12px→0)` + `opacity(0→1)`, `500ms`, `--ease-spring`, 80ms delay.

---

## Critical Bug Fix (from v1)
The v1 `/contact` rendered `&nearr;` as a literal string for social link arrows.
**Fix:** Use the Unicode character `↗` directly in JSX. Never use HTML entities for arrows in React.

---

## Acceptance Criteria
- [ ] `↗` renders as the actual arrow character on all social links and email link — not `&nearr;`
- [ ] Form submission works (Formspree/Web3Forms endpoint configured)
- [ ] Success and error states are handled and visible
- [ ] All links open in new tab with `rel="noopener noreferrer"`
- [ ] Form inputs have visible focus state (`--color-accent` border + glow)
- [ ] No horizontal overflow on 375px
- [ ] Keyboard navigation: tab order is Name → Email → Message → Send
