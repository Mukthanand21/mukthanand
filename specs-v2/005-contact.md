# specs-v2 / 005 — /contact (POST /hire)

## Purpose
Make it easy to reach out. Framed as `POST /hire` — consistent with system metaphor. Form actually works via Web3Forms.

## Layout
Two columns on desktop (form left, links right). Single column on mobile (form first, links below).

## Form
- Fields: NAME (text), EMAIL (email), MESSAGE (textarea, 4 rows)
- Labels: mono, uppercase, muted
- Inputs: dark background, thin border, accent focus ring
- Submit: gold filled button, `Send →`, transitions to dimmed gold on hover
- Success state: form replaced with `REQUEST_RECEIVED` + request ID in green
- Error state: `REQUEST_FAILED` banner with email fallback

## Links Column
- **Direct Email:** Click-to-copy button for `mukthanandreddy21@gmail.com`
- **Social:** GitHub, GitLab, LinkedIn, Resume — styled buttons with icons and arrow indicators

## Scroll Animation
Form and links column reveal via `<Reveal>` component — form from left, links from right, staggered.

## Acceptance
- [ ] Form submission works (Web3Forms endpoint configured)
- [ ] Success and error states handled and visible
- [ ] All social links open in new tab with `rel="noopener noreferrer"`
- [ ] `↗` renders as Unicode arrow character, not `&nearr;`
- [ ] Form inputs have visible focus state (gold border + glow)
- [ ] Keyboard navigation: Name → Email → Message → Send
