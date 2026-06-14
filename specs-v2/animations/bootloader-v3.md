# specs-v2/animations/bootloader-v3.md
> **STATUS: DRAFT**
> Full animation spec for `src/components/BootLoader.tsx` v3.
> A working reference demo was built and approved before this spec was written.
> Implement exactly as described. Do not add, remove, or reorder stages.

> **Color adaptation note:** The reference demo was built on `#2E1F2E` (deep plum).
> This adaptation uses the project's existing `--color-bg: #0A0A0A` (near-black).
> All intermediate animation colors (plum/mauve tones) have been verified to
> work on `#0A0A0A` — they are all significantly lighter than the background
> and the dim→brightening arc reads correctly.

---

## Overview

A cinematic, multilingual name-reveal bootloader.
Each letter of `MUKTHANAND` is assigned one Indian language.
Each letter scrambles through random Indian script characters (fast flicker),
then locks to its assigned script — staggered left to right.
Once all 10 letters are locked in their scripts, they all flip to English simultaneously.
No particle burst. No `REDDY`. The name `MUKTHANAND` is the full reveal.

---

## The 10 Letter → Language Mapping (LOCKED)

| Index | English | Script Char | Language | Google Font |
|---|---|---|---|---|
| 0 | M | మ | Telugu | Noto Sans Telugu |
| 1 | U | उ | Hindi | Noto Sans Devanagari |
| 2 | K | க | Tamil | Noto Sans Tamil |
| 3 | T | ತ | Kannada | Noto Sans Kannada |
| 4 | H | হ | Bengali | Noto Sans Bengali |
| 5 | A | അ | Malayalam | Noto Sans Malayalam |
| 6 | N | न | Marathi | Noto Sans Devanagari |
| 7 | A | અ | Gujarati | Noto Sans Gujarati |
| 8 | N | ਨ | Punjabi | Noto Sans Gurmukhi |
| 9 | D | ଡ | Odia | Noto Sans Oriya |

---

## Scramble Character Pool

Use this pool of Indian script characters for the scramble phase (random picks):

```
మ న క ర ఉ అ ల వ త హ
त न क र ह उ म
ம ந க ர ல வ த
ಮ ನ ಕ ರ ಲ ವ ತ ಹ
ম ন ক র ল ভ
അ ന ക ര ല വ
न म क र ह
અ ન ક ર લ
ਨ ਮ ਕ ਰ ਲ
ଡ ନ କ ର ଲ
```

---

## Stage Sequence

### Stage 1 — Black flash (0ms – 80ms)
- Background: `#000000`
- Nothing visible. Cold start.

### Stage 2 — Boot begins (80ms)
- Background changes to `var(--color-bg)` (`#0A0A0A`) — no transition needed
  (visually identical to `#000` at this luminance)
- Ambient floating particles begin (see §Ambient Particles)
- Status line appears: `INITIALIZING SYSTEM...` — color `var(--color-text-muted)`
- Progress bar: `5%`

### Stage 3 — Identity scan (880ms)
- Status changes to: `SCANNING IDENTITY...` — color `var(--color-text-muted)`
- Progress bar: `15%`
- Letter scramble begins (see §Letter Scramble)

### Stage 4 — Letters lock to scripts (staggered, 880ms – ~3000ms)
- Each letter locks to its assigned Indian script, staggered `200ms` apart
- Progress bar increments as each letter locks: `15% + (lockedCount / 10 * 55)%`

### Stage 5 — Anticipation hold (~3000ms – ~4200ms)
- All 10 script chars locked and visible, dim (`color: #7A5A8A`)
- Status: `RESOLVING...` — color `#8A6A8A`
- After 300ms: all locked chars brighten together — `color: #AA7ACC`, `transition: color 0.7s`
- Progress bar: `80%`
- After 900ms total hold: status clears
- Progress bar: `95%`

### Stage 6 — THE REVEAL (simultaneous English flip)
- Progress bar: `100%`
- Subtle gold flash overlay: `background: var(--color-accent)`, `opacity: 0.15`, duration `70ms`, then fades out
- All 10 spans simultaneously:
  - `font-family` → `'Syne', sans-serif`
  - `textContent` → English letter (`M`, `U`, `K`, `T`, `H`, `A`, `N`, `A`, `N`, `D`)
  - `color` → `var(--color-text-primary)` (`#F3EAEF`)
  - `text-shadow` → `0 0 40px rgba(232,182,90,0.5)` — fades out over `600ms`
- Transition: `color 0.5s ease-out, font-family 0.2s`

### Stage 7 — System ready (500ms after reveal)
- Gold underline sweeps in: `width: 0 → 300px`, `transition: width 1.2s cubic-bezier(0.16,1,0.3,1)`
- `SYSTEM` label appears below name: `opacity: 0 → 1`, `transition: opacity 0.6s`
  - Font: `JetBrains Mono`, `font-size: clamp(12px, 2vw, 17px)`, `letter-spacing: 0.4em`, color `var(--color-accent)`
- After 400ms: status line types in `SYSTEM READY`
  - Typewriter: one character at a time, `55ms` per character, with `▌` cursor
  - Color: `var(--color-accent)`
- **No particle burst. No REDDY. Sequence ends here.**
- Boot complete. Page content reveals behind/after loader.

---

## Letter Scramble (per letter)

Each letter runs this independently, triggered `200ms` after the previous letter starts.

```
totalCycles = 10  (random script chars shown before locking)

for count 0..9:
  pick random char from scramble pool
  display in span
  color:
    count < 5  → #3D2A3D  (very dim)
    count >= 5 → #5A3A6A  (slightly brighter)
  font-family: any Noto Sans script font (use Telugu as base for random phase)
  interval: 55ms + random(0–30ms)  →  55–85ms per frame

on count == 10 (LOCK):
  span.textContent = assigned script char (e.g. 'మ')
  span.fontFamily  = assigned language font
  span.color       = #7A5A8A  (dim — locked in script, not English yet)
  text-shadow: 0 0 12px rgba(232,182,90,0.25) — fades after 150ms
  → trigger onLock callback
```

Language label (above name row):
- Shows assigned language name (`Telugu`, `Hindi`, etc.) when each letter begins scrambling
- Fade in `100ms`, visible for `600ms`, fade out
- Font: `JetBrains Mono`, `11px`, `letter-spacing: 0.25em`, uppercase, color `var(--color-text-muted)`

---

## Layout

```
[lang-label]           ← language name, fades in/out per letter
[M][U][K][T][H][A][N][A][N][D]   ← letter row
SYSTEM                 ← mono gold, appears after reveal
──────────────────     ← gold gradient underline
SCANNING IDENTITY...   ← status line
████░░░░░░░░░░░░░░     ← progress bar (160px wide, 1px tall)
15%                    ← percentage
```

### Letter span styles
```css
font-size: clamp(36px, 6.5vw, 70px);
font-weight: 700;
display: inline-block;
min-width: 0.58em;
text-align: center;
line-height: 1.1;
gap between spans: 2px
```

### Progress bar
```css
width: 160px;
height: 1px;
background (track): #1E141E;
fill: var(--color-accent);
transition: width 0.4s ease-out;
```

---

## Ambient Particles

Subtle gold dust floating in background throughout the sequence.

```
count: 14
radius: 0.4–1.2px
opacity: 0.04–0.14
speed: 0.15px/frame (very slow drift)
color: var(--color-accent)
technique: canvas, requestAnimationFrame loop
wrap at canvas edges (modulo)
```
Runs from Stage 2 onward. Never stops during bootloader lifetime.

---

## Color Reference

All colors used in the bootloader, mapped to their purpose:

| Value | Token / Role | Usage |
|---|---|---|
| `#000000` | — (momentary) | Stage 1 cold start flash (80ms) |
| `var(--color-bg)` = `#0A0A0A` | Design token | Background from Stage 2 onward |
| `#1E141E` | — | Progress bar track (subtle warm tint) |
| `#3D2A3D` | — | Scramble chars, cycles 0–4 (very dim) |
| `#5A3A6A` | — | Scramble chars, cycles 5–9 (brighter) |
| `#7A5A8A` | — | Locked script chars (dim, pre-reveal) |
| `#8A6A8A` | — | `RESOLVING...` status text |
| `#AA7ACC` | — | Brightened locked chars (anticipation) |
| `var(--color-accent)` = `#E8B65A` | Design token | Progress bar fill, SYSTEM text, gold flash, underline |
| `var(--color-text-primary)` = `#F3EAEF` | Design token | English reveal letter color |
| `var(--color-text-muted)` = `#6B4D6B` | Design token | Status lines, language labels, percentage |

> **Note:** The intermediate plum/mauve animation colors (`#3D2A3D`, `#5A3A6A`,
> `#7A5A8A`, `#8A6A8A`, `#AA7ACC`, `#1E141E`) are **local to the BootLoader
> component** — they are animation state colors used to build tension before the
> gold reveal. They are not design system tokens and should not be referenced
> outside of `BootLoader.tsx`.

---

## Implementation Phases

### Phase 1 — Spec + Fonts + CSS cleanup

| File | Change |
|---|---|
| `specs-v2/animations/bootloader-v3.md` | ✓ Done — this file |
| `index.html` | Add Syne + Noto Script font `<link>` tags. Remove preload for old fonts. |
| `src/styles/fonts.css` | Remove `@import` for Inter + JetBrains Mono (now loaded via `<link>` in `index.html`). Add Syne + Noto Script `@import` or keep in `index.html`. |
| `src/styles/index.css` | Remove old CRT keyframes: `crt-warmup`, `crt-flicker`, `glitch-text`, `cursor-blink`. No longer needed. |

### Phase 2 — Layout cleanup + BootLoader rewrite

| File | Change |
|---|---|
| `src/components/Layout.tsx` | Remove `sessionStorage` check from `useState` — replace with `useState(false)`. |
| `src/components/BootLoader.tsx` | Full rewrite — 7-stage script scramble sequence. Remove all v2 code (wireframe cube, CRT effects, scanline mask, glitch). Implement new sequential logic. |

### Phase 3 — Polish + review

| Task | Detail |
|---|---|
| Mobile testing | Verify at 375px and 768px viewport widths. Letter row should shrink via `clamp(36px, 6.5vw, 70px)`. |
| Reduced motion | Verify `prefers-reduced-motion: reduce` shows final state immediately with 200ms fade. |
| Lighthouse | Check performance and accessibility. |
| Code review | Verify no hardcoded hex violations, no sessionStorage, no Framer Motion. |

---

## Reduced Motion

If `prefers-reduced-motion: reduce`:
- Skip all stages entirely
- Show `MUKTHANAND` in English immediately (`color: var(--color-text-primary)`)
- `SYSTEM` and gold line appear instantly
- 200ms opacity fade, boot complete

```typescript
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (reduced) {
  // show final state immediately, 200ms opacity fade
}
```

---

## Replay Behavior

Boot sequence runs on **every page load and hard reload**.
No `sessionStorage`. No skip logic. No replay button.
Internal SPA navigation (React Router) does NOT retrigger the boot sequence.

---

## What NOT to do

- Do NOT add a particle burst at the end
- Do NOT show `REDDY` anywhere in the bootloader
- Do NOT add `sessionStorage` skip logic
- Do NOT add a replay button
- Do NOT add sound
- Do NOT use Framer Motion — vanilla rAF + CSS transitions only
- Do NOT hardcode any hex color that has a CSS custom property equivalent
- Do NOT change the 10-letter language mapping
