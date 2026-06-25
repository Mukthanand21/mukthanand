# specs-v2 / 002 — /services (Projects as Services)

## Purpose
Present real projects as running API services. Honest scoping is mandatory. Cards are read top to bottom like an API reference.

## Layout
Section slug + description, then a vertical list of service cards. Each card is full-width.

## Service Card Anatomy
- **Method badge:** `POST /retrieve` — mono, accent color, border, uppercase
- **Status dot:** `● live` (green) or `● archived` (muted)
- **Service name:** Large, off-white, transitions to accent on hover
- **Description:** 2–3 sentences, honest scoping
- **Tech tags:** Pill-shaped, mono, muted
- **Footer metrics:** `status: 200 OK`, `response: 87ms`, `uptime: 142d` — decorative system-style data
- **Link:** Top-right, opens in new tab

## Services List
| Method | Path | Name | Status |
|---|---|---|---|
| POST | /retrieve | Ask Your Corpus | live |
| POST | /chat | Scheme Saathi | live |
| GET | /faq | FAQ Sense | live |
| GET | /pharmacy | MediFlow AI | archived |

## Scroll Animation
Cards reveal via `<Reveal>` component — `translateY(24px→0)` + `opacity(0→1)`, staggered 80ms. Each card animates once.

The `rack-exit` transition (from `/status`) targets `#services [data-section-card]` to drop cards in as the rack slides out.

## Acceptance
- [ ] Method badge + status on same row, never wrapping on 375px
- [ ] All links open in new tab with `rel="noopener noreferrer"`
- [ ] Archived services visually de-emphasised (dashed border, lower opacity)
- [ ] Honest scoping — no claims of solo authorship for shared-repo work
- [ ] Tech tags wrap cleanly on mobile
