# specs-v2 / 001 — /status (Hero)

## Purpose
First thing the visitor sees after the boot sequence. 3D server rack background, identity, availability, and current focus. This section holds the signature animated moment.

## Layout
- **Background:** Full-viewport 3D server rack scene (Three.js / RackScene) behind a dark gradient overlay for text legibility
- **Content:** Centered identity block with giant hero name, role line (KineticSwapper cycling words), description, CTA buttons
- **Below content:** Ticker component (continuous horizontal scroll)
- **Overlays:** Grain texture (`opacity: 0.035`), vignette, dark gradient

## Content
- Version tag: `v3.0.0 — final year build` (mono, muted)
- Name: `Mukthanand` (hero size, off-white) + `Reddy.` (hero size, gold accent)
- Gold accent line below name
- KineticSwapper: cycling roles (Backend Systems, Full-Stack Applications, AI Products, Open Source)
- Description: 1–2 sentences about what Mukthanand does
- CTA buttons: `view projects` (gold filled) + `download resume` (outline)
- Ticker: continuous scroll with stats

## Entrance
Revealed by the BootLoader's mask reveal stage. No separate entrance animation — the boot sequence handles it.

## Scroll
- Below the hero: Ticker at `z-10`
- Rack scene container (`#rack-scene-container`) is targeted by the `rack-exit` GSAP transition — slides left when user scrolls to `/services`

## Acceptance
- [ ] Name renders at `clamp(52px, 8vw, 88px)` — never wraps to 3 lines
- [ ] CTA buttons have hover states matching spec
- [ ] 3D rack scene renders behind content
- [ ] Ticker loops seamlessly
- [ ] No horizontal overflow
